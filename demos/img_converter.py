from PIL import Image
import os, json, uuid

timestamp = '06.07.2020_10-07-37'

current_directory = os.path.dirname(os.path.realpath(__file__))
directory = os.path.join(current_directory, 'gathered_data', timestamp)
result_directory = os.path.join(current_directory, 'results')

json_dir = os.path.join(directory, (timestamp + '.json'))

image_data = []

for file in sorted(os.listdir(directory)):
     filename = os.fsdecode(file)
     if filename.endswith(".jpg") or filename.endswith(".jpeg"):
        img = Image.open(os.path.join(directory, filename)).convert('L')  # convert image to 8-bit grayscale
        WIDTH, HEIGHT = img.size
        data = list(img.getdata())
        image_data.append(data)


with open(os.path.join(directory, filename), 'r') as f:
    output = json.load(f)
    for index in range(0, len(output['controls_list'])):
        output['controls_list'][index]['image'] = image_data[index]

output['controls_list'] = [n for n in output['controls_list'] if n['controls'] != 0]

tempfile = os.path.join(result_directory, (timestamp + '.json'))
with open(tempfile, 'w') as f:
    json.dump(output, f)

# os.rename(tempfile, filename)
