# Generated by Django 3.0.7 on 2020-07-18 04:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0005_auto_20200717_1649'),
    ]

    operations = [
        migrations.RenameField(
            model_name='connections',
            old_name='sunTheory',
            new_name='subTheory',
        ),
    ]
