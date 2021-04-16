
def capitalize(word):
    i = 0
    while not word[i].isalpha():
        i += 1
    new = word[:i] + word[i:].capitalize()
    return new
