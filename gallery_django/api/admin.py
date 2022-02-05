from django.contrib import admin
from .models import Album, Photo, PhotoComment, PhotoLike
# Register your models here.


admin.site.register(Album)
admin.site.register(Photo)
admin.site.register(PhotoComment)
admin.site.register(PhotoLike)