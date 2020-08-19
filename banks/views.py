from django.shortcuts import render, reverse
from django.views.generic import (ListView,
                                  CreateView,
                                  DetailView,
                                  DeleteView,
                                  UpdateView
                                  )
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.models import User
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError
from django import forms
from django_currentuser.middleware import get_current_user, get_current_authenticated_user
import sqlite3
from .models import Banks, Parameters, Cycles, Positions, LoanLedger
from django.db.models.query import RawQuerySet
from jinja2 import Template

def parameters(user):
    db = sqlite3.connect('db.sqlite3')
    cursor = db.cursor()
    sql = 'select * from banks_parameters ' \
          + 'inner join auth_user on auth_user.id = banks_parameters.ModelUser_id ' \
          + 'where auth_user.username = "{}" '.format(user)
    cursor.execute(sql)
    rows = cursor.fetchall()
    if not rows:
        sql = 'select id from auth_user where username = "{}"'.format(user)
        rows = cursor.execute(sql)
        for row in rows:
            mui = row[0]
            Parameters.objects.create(ReservePercent=20.00, NumberCycles=5, ModelUser_id=mui)



class BankListView(ListView):
    model = Banks
    base_datatable_class = Banks
    template_name = 'banks/banks_home.html'
    context_object_name='banks'
    fields = ['Bank_id','BankCode', 'BankName', 'CentralBankFlag', 'Deposits', 'Loans']
    ordering=['BankCode']

    def get_queryset(self):
        user = self.request.user
        parameters(user)
        return Banks.objects.filter(ModelUser_id=self.request.user)


class BankDetailView(ListView):
    model = Banks
    template_name = 'banks/banks_detail.html'
    fields = ['id']

    def get_queryset(self):
        bank_id = self.kwargs['pk']
        sql = 'select banks_banks.*, ' \
              'banks_cycles.id as cycle_id, ' \
              'banks_cycles.cyclenumber as cyclenumber, ' \
              'banks_cycles.depositchange as depositchange, ' \
              'banks_cycles.loanchange as loanchange, ' \
              'banks_positions.id as pos_id, ' \
              'banks_positions.deposits as pos_deposits, ' \
              'banks_positions.deposits_currency as pos_deposits_currency, ' \
              'banks_positions.loans as pos_loans, ' \
              'banks_positions.loansurplus as pos_loansurplus, ' \
              'banks_positions.LOanDeficit as LoanDeficit from banks_banks ' \
              'inner join banks_cycles on banks_banks.id = banks_cycles.bank_id '\
	          'inner join banks_positions on banks_cycles.CycleNumber = banks_positions.CycleNumber '\
	          'where banks_banks.id = {} '\
                'and banks_positions.bank_id = {} '\
              'order by banks_cycles.cyclenumber'.format(bank_id, bank_id,)
        x = Banks.objects.raw(sql)
        return x

class PositionsAllBanks(ListView):
    model = Banks
    template_name = 'banks/positions_all_banks.html'
    fields = ['id']

    def get_queryset(self):
        user = self.request.user.id
        x = Positions.objects.select_related('Bank')._next_is_sticky().filter(Bank__ModelUser_id=user)\
                            .filter(Bank__CentralBankFlag=False).prefetch_related('Bank')\
                            .order_by('Bank__BankCode', 'CycleNumber')
        return x

class LoanLedgerList(ListView):
    model = LoanLedger
    template_name = 'banks/loan_ledger.html'
    fields = ['id']

    def get_queryset(self):
        user = self.request.user.id
        x = LoanLedger.objects.select_related('LendingBank')._next_is_sticky()\
                .filter(LendingBank__ModelUser_id=user)\
                .order_by('CycleNumber')
        return x


class BankCreateView(LoginRequiredMixin,CreateView):
    model = Banks
    fields = ['BankCode', 'BankName', 'CentralBankFlag', 'Deposits', 'Loans']

    def form_valid(self, form):
        form.instance.ModelUser_id = self.request.user.id
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('banks_home')

class BankUpdateView(LoginRequiredMixin,UserPassesTestMixin,UpdateView):
    model = Banks
    fields = ['BankCode','BankName','CentralBankFlag', 'Deposits', 'Loans']

    def form_valid(self, form):
        form.instance.ModelUser_id = self.request.user
        return super().form_valid(form)

    def test_func(self):
        bank = self.get_object()
        if bank.ModelUser_id == self.request.user.id:
            return True
        return False

    def get_success_url(self):
        bank = self.get_object()
        return '/facer/mmt/banks/{}/'.format(bank.id)


class BankDeleteView(LoginRequiredMixin,UserPassesTestMixin,DeleteView):
    model = Banks
    success_url = '/facer/mmt/banks/'

    def test_func(self):
        bank = self.get_object()
        if bank.ModelUser_id == self.request.user.id:
            return True
        return False

class ParameterListView(ListView):
    model = Parameters
    context_object_name = 'parameters'
    fields = ['ReservePercent','NumberCycles']
    template_name = 'banks/parameters/parameters_home.html'

    def get_queryset(self):
        param = Parameters
        user = User.objects.filter(username=self.request.user).values('id')[0]
        id = user['id']
        return Parameters.objects.filter(ModelUser_id=id)

class ParameterUpdateView(LoginRequiredMixin,UserPassesTestMixin,UpdateView):
    model = Parameters
    fields = ['ReservePercent','NumberCycles']
    success_url = '/facer/mmt/banks/parameters'

    def form_valid(self, form):
        form.instance.ModelUser_id = self.request.user
        return super().form_valid(form)

    def test_func(self):
        param = self.get_object()
        if param.ModelUser_id == self.request.user.id:
            return True
        return False