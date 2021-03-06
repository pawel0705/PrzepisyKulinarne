# Generated by Django 3.0.14 on 2022-01-06 17:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0008_auto_20220103_1859'),
    ]

    operations = [
        migrations.AlterField(
            model_name='recipe',
            name='mainImage',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='recipes.RecipeImage'),
        ),
        migrations.AlterField(
            model_name='recipeimage',
            name='file',
            field=models.ImageField(upload_to=''),
        ),
    ]
