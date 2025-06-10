import os
from bs4 import BeautifulSoup

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
HTML_PATH = os.path.join(REPO_ROOT, 'index.html')


def get_soup():
    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        return BeautifulSoup(f, 'html.parser')


def test_footer_contains_one_p():
    soup = get_soup()
    footer = soup.find('footer', id='footer')
    assert footer is not None, 'Footer with id="footer" not found'
    p_tags = footer.find_all('p')
    assert len(p_tags) == 1, f"Expected exactly one <p> in footer, found {len(p_tags)}"


def test_all_images_have_alt():
    soup = get_soup()
    images = soup.find_all('img')
    assert images, 'No <img> tags found in index.html'
    for img in images:
        assert img.has_attr('alt'), f"Image {img} missing alt attribute"
        assert img['alt'].strip(), f"Image {img} has empty alt attribute"
