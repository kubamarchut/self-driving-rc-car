import numpy as np
import cv2

def crop_bottom_half(img):
    cropped_img = img[int(img.shape[0]/2):int(img.shape[0])]
    return cropped_img

def increase_brightness(img, value=30):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    lim = 255 - value
    v[v > lim] = 255
    v[v <= lim] += value

    final_hsv = cv2.merge((h, s, v))
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return img

cap = cv2.VideoCapture(0)

while 1:
    ret, img = cap.read()
    height, width, channels = img.shape
    bottom_img = crop_bottom_half(img)


    gray = cv2.cvtColor(bottom_img, cv2.COLOR_BGR2GRAY)


    kernel_size = 7
    blur_gray = cv2.GaussianBlur(gray,(kernel_size, kernel_size),0)
    low_threshold = 50
    high_threshold = 150
    bright = cv2.equalizeHist(blur_gray)
    edges = cv2.Canny(blur_gray, low_threshold, high_threshold)

    rho = 1  # distance resolution in pixels of the Hough grid
    theta = np.pi / 180  # angular resolution in radians of the Hough grid
    threshold = 50  # minimum number of votes (intersections in Hough grid cell)
    min_line_length = 10  # minimum number of pixels making up a line
    max_line_gap = 40  # maximum gap in pixels between connectable line segments
    line_image = np.copy(bottom_img) * 0  # creating a blank to draw lines on

    # Run Hough on edge detected image
    # Output "lines" is an array containing endpoints of detected line segments

    lines = cv2.HoughLinesP(edges, rho, theta, threshold, np.array([]),
                        min_line_length, max_line_gap)

    if lines is not None:
        for line in lines:
            for x1,y1,x2,y2 in line:
                cv2.line(line_image,(x1,y1),(x2,y2),(0,0,255),3)

    blank_image = np.zeros((height//2,width,3), np.uint8)

    lines_edges2 = cv2.addWeighted(blank_image, 1, line_image, 1, 0)

    cv2.imshow('img',img)
    cv2.imshow('lines', lines_edges2)
    cv2.imshow('gray', gray)
    cv2.imshow('blur', blur_gray)
    cv2.imshow('EDGES', edges)
    cv2.imshow('brightness', bright)
    k = cv2.waitKey(30) & 0xff
    if k == 27:
        break

cap.release()
cv2.destroyAllWindows()
