# Batch photos

Add or replace photos in this folder. Match the filename to the batch number:

| Batch | Photo filename |
| --- | --- |
| DEMO-001 | demo-001.jpg |
| DEMO-002 | demo-002.jpg |
| DEMO-003 | demo-003.jpg |
| DEMO-004 | demo-004.jpg |
| DEMO-005 | demo-005.jpg |
| DEMO-006 | demo-006.jpg |
| DEMO-007 | demo-007.jpg |
| DEMO-008 | demo-008.jpg |
| DEMO-009 | demo-009.jpg |
| DEMO-010 | demo-010.jpg |

JPG, JPEG, PNG and WebP are supported. Filenames match without regard to case.
Use one photo per batch. If multiple formats exist for one batch, the first
available format in this order wins: .jpg, .jpeg, .png, .webp.

Batches without a photo show an "Image coming soon" placeholder. A photo that
cannot load also shows the placeholder. The product title comes from the batch
name in admin; the photo's filename does not change the title.

To swap photos, replace or rename the files to match the desired batches. Refresh
the local page to see changes. Commit and push the images to deploy them online.
Replacing a photo changes its cache version automatically on the next deployment.

The same filename rule works for other active batches added through admin.
Adding a photo does not create or activate a batch record.
