import evdev
from evdev import InputDevice, ecodes, UInput

# Define the words to detect
WORDS_TO_DETECT = ["test", "hello", "world"]

# Track state of input
typed_chars = []

def process_key_event(event):
    global typed_chars

    if event.type == ecodes.EV_KEY and event.value == 1:  # Key press event
        key = ecodes.KEY[event.code]

        if key.startswith("KEY_"):
            char = key[4:].lower()

            if len(char) == 1 and char.isprintable():  # Valid single character input
                typed_chars.append(char)
                
                # Only keep the last max(len(word) for word in WORDS_TO_DETECT) characters
                max_word_length = max(len(word) for word in WORDS_TO_DETECT)
                if len(typed_chars) > max_word_length:
                    typed_chars.pop(0)

                # Check for a match
                for word in WORDS_TO_DETECT:
                    if "".join(typed_chars[-len(word):]) == word:
                        print(f"Detected the word '{word}'! Triggering backspace.")
                        simulate_backspace(len(word))

# Simulate backspace presses
def simulate_backspace(count):
    with UInput() as ui:
        for _ in range(count):
            ui.write(ecodes.EV_KEY, ecodes.KEY_BACKSPACE, 1)  # Press
            ui.write(ecodes.EV_KEY, ecodes.KEY_BACKSPACE, 0)  # Release
        ui.syn()

def main():
    device = None

    # Locate a suitable input device
    for dev_path in evdev.list_devices():
        dev = InputDevice(dev_path)
        if "keyboard" in dev.name.lower():
            device = dev
            break

    if not device:
        print("No keyboard device found!")
        return

    print(f"Using device: {device.name}")
    
    try:
        for event in device.read_loop():
            process_key_event(event)
    except KeyboardInterrupt:
        print("Exiting...")

if __name__ == "__main__":
    main()