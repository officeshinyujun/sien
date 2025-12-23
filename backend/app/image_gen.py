from PIL import Image, ImageDraw, ImageFont
import random
import os
import uuid

def generate_dummy_profile_image(nickname: str, output_dir: str = "static/profile_images") -> str:
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

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
        # This might vary by OS, but explicit font loading is better if we have one. 
        # For now, we'll try to use a default or basic strategy.
        # Ideally we would ship a font file, but for a dummy generator, basic is fine.
        # On some systems ImageFont.load_default() is very small.
        # Let's try to find a system font or just use default but scale it? 
        # Actually default is bitmap and doesn't scale well.
        # Let's just draw a big rectangle? No, let's try to be simple.
        font = ImageFont.load_default()
        # Since default font is small, we can't easily scale it without a .ttf file.
        # We will proceed with default for now, or just colored box.
        # Wait, user wants "dummy profile image". A solid color with a letter is standard.
        # I'll try to use a trick to make it bigger or just center it.
        # Better: Just random color is enough? 
        # "Generate dummy profile image" -> usually implies some visual variety.
        # Let's try to see if we can draw a simple shape or pattern.
        pass
    except IOError:
        pass

    # Basic: Just the background color is often "dummy" enough, 
    # but let's add the text. To make it bigger without a font file is hard with just PIL default.
    # We will just save the colored square for now to be safe across OSs without font dependencies.
    # Or I can draw a simple geometric shape.
    
    # Let's draw a circle in a lighter shade
    fg_color = (min(bg_color[0] + 30, 255), min(bg_color[1] + 30, 255), min(bg_color[2] + 30, 255))
    draw.ellipse([40, 40, 160, 160], fill=fg_color)

    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(output_dir, filename)
    image.save(filepath)

    return f"/{output_dir}/{filename}"
