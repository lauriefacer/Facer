# Generated by Django 3.0.7 on 2020-07-17 04:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0002_connections'),
    ]

    operations = [
        migrations.AddField(
            model_name='theories',
            name='description',
            field=models.TextField(default=''),
        ),
    ]
