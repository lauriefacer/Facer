from django.urls import path, include
from .views import (BankListView,
                    BankCreateView,
                    BankDetailView,
                    BankDeleteView,
                    BankUpdateView,
                    ParameterListView,
                    ParameterUpdateView,PositionsAllBanks,
                    LoanLedgerList)
from .apiViews import (savecycle,
                       calculate_positions,
                       positions_calculate_all,
                       reconcile_bank_positions)

urlpatterns = [
    path('',BankListView.as_view(),name='banks_home'),
    path('<int:pk>/',BankDetailView.as_view(),name='banks_detail'),
    path('new/',BankCreateView.as_view(),name='banks_create'),
    path('<int:pk>/update/', BankUpdateView.as_view(), name='banks_update'),
    path('<int:pk>/delete',BankDeleteView.as_view(),name='banks_delete'),
    path('parameters/',ParameterListView.as_view(),name='parameters_home'),
    path('parameters/<int:pk>/update/', ParameterUpdateView.as_view(), name='parameters_update'),
    path('savecycle/',savecycle,name='savecycle'),
    path('calculate_positions/',calculate_positions,name='calculatepositions'),
    path('positions_calculate_all/',positions_calculate_all,name='positions_calculate_all'),
    path('positions_all_banks/',PositionsAllBanks.as_view(),name='positions_all_banks'),
    path('reconcile_bank_positions/',reconcile_bank_positions,name='reconcile_bank_positions'),
    path('loan_ledger/',LoanLedgerList.as_view(),name='loan_ledger'),
]