# Generated by Django 3.0.7 on 2020-06-18 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('banks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='banks',
            name='BankCode',
            field=models.CharField(max_length=10),
        ),
        migrations.AlterField(
            model_name='banks',
            name='ReservePercent',
            field=models.FloatField(default='0.0'),
        ),
    ]