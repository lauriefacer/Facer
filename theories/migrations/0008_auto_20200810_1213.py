# Generated by Django 3.0.7 on 2020-08-10 02:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('theories', '0007_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='components',
            name='concept',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conceptcomponent', to='theories.Concepts'),
        ),
        migrations.AlterField(
            model_name='theoryconcepts',
            name='theory',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='theoryconcept', to='theories.Theories'),
        ),
    ]