# Generated by Django 3.0.7 on 2020-08-12 02:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0010_treeviewmodel_action'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='treeviewmodel',
            name='action',
        ),
    ]