clean:
	# rm **/*.pyc
	find . -name \*.pyc -delete
	rm -rf .tree

newdb:
	rm -rf data/db1
	python manage.py syncdb
