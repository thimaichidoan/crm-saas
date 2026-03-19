import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "crm_project.settings")
django.setup()

from users.models import User

if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser(
        username="admin",
        email="admin@test.com",
        password="123456789"
    )
    print("✅ Admin created")
else:
    print("⚠️ Admin already exists")