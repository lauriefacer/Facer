# Generated by Django 3.1 on 2020-08-19 06:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0016_breadcrumbs'),
    ]

    operations = [
        migrations.AddField(
            model_name='concepts',
            name='url_link',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='theoryconcepts',
            name='url_link',
            field=models.CharField(default='', max_length=200),
        ),
    ]
