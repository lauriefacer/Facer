from django.db import models
from django.contrib.auth.models import User
from django import forms
from django.core import validators
from django_currentuser.middleware import get_current_user, get_current_authenticated_user
from django.db.models.signals import post_save
from djmoney.models.fields import MoneyField
import sqlite3

class Parameters(models.Model):
    ModelUser = models.ForeignKey(User, on_delete=models.CASCADE)
    ReservePercent = models.FloatField(default='20.0')
    NumberCycles = models.IntegerField(default='5')


class Banks(models.Model):
    ModelUser = models.ForeignKey(User, on_delete=models.CASCADE)
    BankCode = models.CharField(max_length=10)
    BankName = models.CharField(max_length=30)
    CentralBankFlag = models.BooleanField(default=False)
    Deposits = MoneyField(max_digits=14,decimal_places=0,default_currency='AUD', null=True)
    Loans = MoneyField(max_digits=14,decimal_places=0,default_currency='AUD', null=True)

    def __str__(self):
        return self.BankName

    def clean(self, *args, **kwargs):
        d = self.Deposits * 0
        l = self.Loans * 0
        if not d == l:
            raise forms.ValidationError((f'Deposits and Loans must be in the same currency'),
                                        code='invalid',
                                        params={'value': '1'}, )
        cbf = self.CentralBankFlag
        bank = self.BankCode
        mui = get_current_authenticated_user()
        if cbf:
            db = sqlite3.connect('db.sqlite3')
            cursor = db.cursor()
            sql = 'select BankCode from Banks_Banks '\
	                +' inner join auth_user on auth_user.id = banks_banks.ModelUser_id '\
	                + 'where auth_user.username = "{}" '.format(mui) \
                    + 'and CentralBankFlag = 1 and BankCode <> "{}"'.format(bank)
            cursor.execute(sql)
            for row in cursor.fetchall():
                cbank = row[0]
                raise forms.ValidationError((f'A central bank ({cbank}) already exists: (error: %(value)s)'),
                    code='invalid',
                    params={'value': '1'},)

    def post_save(self):
        print(f'Self: {self.pk}')

class Cycles(models.Model):
    Bank = models.ForeignKey(Banks, related_name= 'cycles', on_delete=models.CASCADE)
    CycleNumber = models.IntegerField()
    DepositChange = models.DecimalField(decimal_places=2, max_digits=4)
    LoanChange = models.DecimalField(decimal_places=2, max_digits=4)

class Positions(models.Model):
    Bank = models.ForeignKey(Banks, on_delete=models.CASCADE)
    CycleNumber = models.IntegerField()
    Deposits = MoneyField(max_digits=14, decimal_places=0, default_currency='AUD', null=True)
    Loans = MoneyField(max_digits=14, decimal_places=0, default_currency='AUD', null=True)
    LoanDeficit = MoneyField(max_digits=14, decimal_places=0, default_currency='AUD', null=True)
    LoanSurplus = MoneyField(max_digits=14, decimal_places=0, default_currency='AUD', null=True)

class LoanLedger(models.Model):
    LendingBank = models.ForeignKey(Banks, on_delete=models.CASCADE,related_name='LendingBank')
    BorrowingBank = models.ForeignKey(Banks, on_delete=models.CASCADE,related_name='BorrowingBank')
    CycleNumber = models.IntegerField()
    Loan = MoneyField(max_digits=14, decimal_places=0, default_currency='AUD', null=True)

def update_params(sender,instance,**kwargs):
    params = Parameters.objects.get(pk=instance.pk)
    banks = Banks.objects.filter(ModelUser_id=instance.ModelUser_id)
    for bank in banks:
        cycles = Cycles.objects.filter(Bank_id=bank.id)
        positions = Positions.objects.filter(Bank_id=bank.id)
        print(f"Bank: {bank.BankCode} - Positions: {len(positions)}")
        if params.NumberCycles > len(cycles):
            cycle = Cycles.objects.filter(Bank_id=bank.id).last()
            if cycle:
                number = len(cycle) + 1
            else:
                number = 1
            for n in range(params.NumberCycles - len(cycles)):
                print(f"Adding cycle: {number}")
                Cycles.objects.create(CycleNumber=number,
                                      DepositChange=0.00,
                                      LoanChange=0.00,
                                      Bank=bank)
                number += 1
        elif params.NumberCycles < len(cycles):
            for n in range(len(cycles) - params.NumberCycles):
                cycle = Cycles.objects.filter(Bank_id=bank.id).last()
                print(f"Deleting cycles: {cycle.id}  Range: {n}")
                cycle.delete()

        if params.NumberCycles > len(positions):
            pos = Positions.objects.filter(Bank_id=bank.id).last()
            if pos:
                number = len(pos) + 1
            else:
                number = 1
            for n in range(params.NumberCycles - len(positions)):
                print(f"Adding position: {number}")
                Positions.objects.create(CycleNumber=n+1,
                                           Deposits=0.00,
                                           Loans=0.00,
                                           LoanDeficit=0.00,
                                           LoanSurplus=0.00,
                                           Bank=bank)
                number += 1
        elif params.NumberCycles < len(positions):
            for n in range(len(positions) - params.NumberCycles):
                pos = Positions.objects.filter(Bank_id=bank.id).last()
                print(f"Deleting positions: {pos.id}  Range: {n}")
                pos.delete()


def create_cycles(sender,instance, **kwargs):
    if kwargs['created']:
        bank = Banks.objects.get(pk=instance.pk)
        params = Parameters
        pos = Positions
        cycles = params.objects.filter(ModelUser_id=instance.ModelUser_id).values('NumberCycles')[0]
        cycle = cycles['NumberCycles']
        for n in range(cycle):
            Cycles.objects.create(CycleNumber=n+1,
                                  DepositChange=0.00,
                                  LoanChange=0.00,
                                  Bank=bank)
            pos.objects.create(CycleNumber=n+1,
                               Deposits=0.00,
                               Loans=0.00,
                               LoanDeficit=0.00,
                               LoanSurplus=0.00,
                               Bank=bank)

post_save.connect(create_cycles,sender=Banks)

post_save.connect(update_params, sender=Parameters)