import math

<<<<<<< HEAD

=======
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

<<<<<<< HEAD
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def is_valid_coordinate(latitude, longitude):
    return -90 <= latitude <= 90 and -180 <= longitude <= 180
=======
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c
>>>>>>> de3c8b2d4a2529ebd9a4a54bdd871216b99429fe
