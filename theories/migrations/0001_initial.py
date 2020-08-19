# Generated by Django 3.0.7 on 2020-07-15 05:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Actions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Theories',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('theory', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Concepts',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('concept', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='theories.Theories')),
            ],
        ),
        migrations.CreateModel(
            name='Components',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('component', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='component', to='theories.Concepts')),
                ('concept', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='theories.Concepts')),
            ],
        ),
        migrations.CreateModel(
            name='Binders',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='theories.Actions')),
                ('component', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='component_concept', to='theories.Components')),
            ],
        ),
    ]