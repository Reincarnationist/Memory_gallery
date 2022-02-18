#from django.utils.functional import cached_property
import uuid
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.core.exceptions import ValidationError

from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFit

from .ImageOptions  import THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, \
	THUMBNAIL_COMPRESS_QUALITY, THUMBNAIL_FORMAT
#from PIL import Image as pImage
#from PIL.ExifTags import TAGS
# Create your models here.


#use s3 directory
def user_directory_path(instance, filename):
	# file will be uploaded to MEDIA_ROOT/<username>/album_<id>/<filename>
	return '{}/album_{}/{}'.format(instance.belong_to.owner.username, instance.belong_to.id, filename)

class Album(models.Model):
	unique_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	title = models.CharField(max_length=20, default='New Album', null=False, blank=False)
	description = models.CharField(max_length=100, null=True, blank=True)
	create_at = models.DateTimeField(auto_now_add=True)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='albums',on_delete=models.CASCADE)
	public = models.BooleanField(default=True, null=False)

	class Meta:
		ordering = ['create_at']

	def __str__(self):
		return self.title
	
class Photo(models.Model):
	unique_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	create_at = models.DateTimeField(auto_now_add=True)
	belong_to = models.ForeignKey(Album, related_name='photos', null=False, on_delete=models.CASCADE)

	@property
	def num_of_likes(self):
		return PhotoLike.objects.filter(belong_to=self).count()

	def file_size(value):
		limit = 20 * 1024 * 1024
		if value.size > limit:
			raise ValidationError('File too large. Size should not exceed 20 MB.')
	
	image = models.ImageField(
								upload_to=user_directory_path, 
								null=False,
								blank=False,
								unique=True,
								validators=[file_size],
								)
	image_thumbnail = ImageSpecField(
								source='image',
								processors=[ResizeToFit(THUMBNAIL_WIDTH,THUMBNAIL_HEIGHT)],
								format=THUMBNAIL_FORMAT,
								options={'quality': THUMBNAIL_COMPRESS_QUALITY},
								)
	class Meta:
		ordering = ['create_at']

	
	def __str__(self):
		return '{}:{}'.format(self.unique_id, self.image_thumbnail.url)


	#Kinda slow with PIL opening the whole image to process
	#might be a better choice to read exif data in the front end

	# @cached_property
	# def exif(self):
	#     """ Retrieve exif data using PIL as a dictionary """
	#     temp = {}
	#     exif_data = {}
	#     self.image.open()
	#     with pImage.open(self.image) as img:
	#         if hasattr(img, '_getexif'):
	#             info = img._getexif()
	#             required_info = {
	#                 'Model', 
	#                 'ShutterSpeedValue', 
	#                 'FNumber',
	#                 'ExposureTime',
	#                 'FocalLength',
	#                 'ISOSpeedRatings'}
	#             for tag, value in info.items():
	#                 decoded = TAGS.get(tag, tag)
	#                 if decoded in required_info:
	#                     temp[decoded] = str(value)

	#             exif_data['Model'] = temp.get('Model', 'unknown')
	#             exif_data['ShutterSpeedValue'] = temp.get('ShutterSpeedValue', 'unknown')
	#             exif_data['FNumber'] = temp.get('FNumber', 'unknown')
	#             exif_data['ExposureTime'] = temp.get('ExposureTime', 'unknown')
	#             exif_data['FocalLength'] = temp.get('FocalLength', 'unknown')
	#             exif_data['ISOSpeedRatings'] = temp.get('ISOSpeedRatings', 'unknown')
	#     return exif_data

class PhotoComment(models.Model):
	unique_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
	timestamp = models.DateTimeField(auto_now_add=True)
	belong_to = models.ForeignKey(Photo, related_name='comments', on_delete=models.CASCADE)
	content = models.CharField(max_length=50)

	class Meta:
		ordering = ['-timestamp']

	def __str__(self):
		return '{}, {} posts at {}: {}'.format(self.unique_id, self.owner.username, self.timestamp, self.content)

class PhotoLike(models.Model):
	belong_to = models.ForeignKey(Photo, related_name='likes', on_delete=models.CASCADE)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	create_at = models.DateTimeField(auto_now_add=True)


@receiver(models.signals.post_delete, sender=Photo)
def remove_file_from_s3(sender, instance, using, **kwargs):
	for field in ['image_thumbnail']:
		field = getattr(instance, field)
		try:
			file = field.file
		except FileNotFoundError:
			pass
		else:
			cache_backend = field.cachefile_backend
			cache_backend.cache.delete(cache_backend.get_key(file))
			field.storage.delete(file.name)
	instance.image.delete(save=False)
