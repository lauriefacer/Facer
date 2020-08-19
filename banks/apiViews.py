from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import F, ExpressionWrapper, DecimalField
from django.db import connection
from django.shortcuts import redirect
from .models import Cycles, Positions, Banks, Parameters, LoanLedger


@csrf_exempt
def savecycle(request):
    id = request.POST.get('id','')
    value = request.POST.get('value', '')
    type = request.POST.get('type', '')
    cycle = Cycles.objects.get(id=id)
    if type == 'depositchange':
        cycle.DepositChange = value
    if type == 'loanchange':
        cycle.LoanChange = value

    cycle.save()

    return JsonResponse({"success":"updated"})

def calculate_position(id):
    print(f"Calculating Position: {id}")
    cycles = Cycles.objects.filter(Bank_id=id)
    bank = Banks.objects.get(id=id)
    params = Parameters.objects.filter(ModelUser=bank.ModelUser)
    for param in params:
        param_id = param.id
        parameter = Parameters.objects.get(id=param.id)
        reserve = parameter.ReservePercent
    deposit = bank.Deposits * 1
    loan = bank.Loans * 1
    for cycle in cycles:
        positions = Positions.objects.filter(Bank=id,CycleNumber=cycle.CycleNumber)
        for position in positions:
            row = Positions.objects.get(id=position.id)
            row.Deposits_Currency=bank.Deposits_currency
            row.Loans_Currency = bank.Loans_currency
            row.Deposits = deposit * (1 + (cycle.DepositChange / 100))
            deposit = row.Deposits
            row.Loans = loan * (1 + (cycle.LoanChange / 100))
            loan = row.Loans
            row.LoanDeficit_Currency = bank.Loans_currency
            row.LoanSurplus_Currency = bank.Loans_currency
            if (deposit/loan)*100 > reserve:
                row.LoanDeficit = 0
                row.LoanSurplus = deposit/(reserve/100) - loan
            else:
                row.LoanDeficit = loan*(reserve/100) - deposit
                row.LoanSurplus = 0
            row.save()

@csrf_exempt
def calculate_positions(request):
    id = request.POST.get("id","")
    calculate_position(id)
    return JsonResponse({"success": "updated"})


@csrf_exempt
def positions_calculate_all(request):
    banks = Banks.objects.filter(ModelUser_id=request.user)
    for bank in banks:
        if not bank.CentralBankFlag:
            print(f"Calculating id: {bank.BankName} - CB Flag: {bank.CentralBankFlag}")
            calculate_position(bank.id)
    return redirect('positions_all_banks')

def delete_loan_ledgers(id):
    banks = Banks.objects.filter(ModelUser_id=id)
    # Delete existing records
    for bank in banks:
        ledger = LoanLedger.objects.filter(LendingBank=bank)
        if ledger:
            ledger.delete()
        else:
            print("Record not found")

def create_full_surplus_entry(pos1,pos2,zero,loan):
    pos1.LoanDeficit = zero
    pos1.save()
    pos2.LoanSurplus = pos2.LoanSurplus - loan
    pos2.save()
    ledger = LoanLedger
    ledger.objects.create(
        LendingBank=pos2.Bank,
        BorrowingBank=pos1.Bank,
        CycleNumber=pos1.CycleNumber,
        Loan=loan)

def create_partial_surplus_entry(pos1,pos2,zero,loan):
    pos2.LoanSurplues = zero
    pos2.save()
    pos1.LoanDeficit = pos1.LoanDeficit - loan
    pos1.save()
    ledger = LoanLedger
    ledger.objects.create(
        LendingBank=pos2.Bank,
        BorrowingBank=pos1.Bank,
        CycleNumber=pos1.CycleNumber,
        Loan=loan
    )

@csrf_exempt
def reconcile_bank_positions(request):
    id = request.user.id
    # recalculate bank positions
    banks = Banks.objects.filter(ModelUser_id=id).filter(CentralBankFlag=False)\
                            .order_by('BankCode')
    for bank in banks:
        print(f"Calculating id: {bank.BankName} - CB Flag: {bank.CentralBankFlag}")
        calculate_position(bank.id)
        #delete existing ledgers
    delete_loan_ledgers(id)
    #clear central bank balances
    cbs = Positions.objects.select_related('Bank')._next_is_sticky()\
                    .filter(Bank__ModelUser=id)\
                    .filter(Bank__CentralBankFlag=True)
    for cb in cbs:
        cb.Loans = cb.Loans * 0.00
        cb.save()
    #create ledger records
    for bank in banks:
        #find positions with deficit loan position
        positions1 = Positions.objects.filter(Bank=bank).order_by('Bank','CycleNumber')
        for pos1 in positions1:
            zero = pos1.LoanDeficit * 0.00
            if pos1.LoanDeficit > zero:
                cycle = pos1.CycleNumber
                outstanding = pos1.LoanDeficit
                #find positions with surplus
                positions2 = Positions.objects.filter(CycleNumber=cycle).select_related('Bank')._next_is_sticky().filter(Bank__ModelUser=id)
                for pos2 in positions2:
                    if pos2.LoanSurplus > zero:
                        if outstanding > zero:
                            if pos2.LoanSurplus > pos1.LoanDeficit:
                                loan = pos1.LoanDeficit
                                print(f"Cycle: {pos1.CycleNumber} - Loan: {loan} - Lending Bank: {pos2.Bank} - Borrowing Bank: {pos1.Bank}")
                                create_full_surplus_entry(pos1,pos2,zero,loan)
                            else:
                                loan = pos2.LoanSurplus
                                create_partial_surplus_entry(pos1,pos2,zero,loan)
                        outstanding = outstanding - loan
                if outstanding > zero:
                    #borrow from the central bank
                    cbs = Banks.objects.filter(ModelUser_id=id).filter(CentralBankFlag=True)
                    for cb in cbs:
                        cbPoses = Positions.objects.filter(CycleNumber=cycle).filter(Bank=cb)
                        for cbPos in cbPoses:
                            print(f"CB Positions: {cbPos}")
                            cbPos.Loans = cbPos.Loans + outstanding
                            print(f"CBA Loans: {cbPos.Bank} - {cbPos.Loans}")
                            cbPos.save()
                            pos1.LoanDeficit = zero
                            pos1.save()
                            ledger = LoanLedger
                            ledger.objects.create(
                                LendingBank=cb,
                                BorrowingBank=pos1.Bank,
                                CycleNumber=pos1.CycleNumber,
                                Loan=outstanding
                            )
    return redirect('loan_ledger')