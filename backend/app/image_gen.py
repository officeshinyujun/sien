from PIL import Image, ImageDraw, ImageFont
import random
import os
import uuid

# Get backend directory path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def generate_dummy_profile_image(nickname: str, output_dir: str = "static/profile_images") -> str:
    # Construct absolute path
    full_output_dir = os.path.join(BASE_DIR, output_dir)
    
    # Ensure output directory exists
    os.makedirs(full_output_dir, exist_ok=True)

    # Random background color
    bg_color = (random.randint(50, 200), random.randint(50, 200), random.randint(50, 200))
    
    # Image size
    size = (200, 200)
    image = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(image)

    # Draw first letter of nickname
    text = nickname[0].upper() if nickname else "?"
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.load_default()
    except IOError:
        pass

    # Draw a circle in a lighter shade
    fg_color = (min(bg_color[0] + 30, 255), min(bg_color[1] + 30, 255), min(bg_color[2] + 30, 255))
    draw.ellipse([40, 40, 160, 160], fill=fg_color)

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(full_output_dir, filename)
    image.save(filepath)

    return f"/{output_dir}/{filename}"
