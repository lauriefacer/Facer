# Generated by Django 3.0.7 on 2020-08-12 05:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0013_auto_20200812_1514'),
    ]

    operations = [
        migrations.AddField(
            model_name='treeviewmodel',
            name='sequence',
            field=models.CharField(default='', max_length=10),
        ),
    ]
