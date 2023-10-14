import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
axios.defaults.baseURL = 'https://pixabay.com/api/';
const key = '39884866-d70e4d00a2666ee51db4ac166';
let page = 1;
const PER_PAGE = 40;
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btn: document.querySelector('.load-more'),
};
let inputValue;
let totalHits;
let sum = 0;
refs.btn.style.display = 'none';
const instance = new SimpleLightbox('.photo-card-link', {
  captionsData: 'alt',
  captionDelay: 250,
});
instance.on('show.simpleLightbox');
refs.form.addEventListener('submit', handleSubmit);

refs.btn.addEventListener('click', handleClick);
async function handleSubmit(event) {
  event.preventDefault();
  inputValue = refs.form.elements[0].value;
  page = 1;
  totalHits = 0;
  sum = 0;
  refs.gallery.innerHTML = '';
  try {
    const elementsForMarkup = await takeData(inputValue);
    if (totalHits > PER_PAGE) {
      refs.btn.style.display = 'block';
    }
    const markup = await createMarkup(elementsForMarkup);
    refs.gallery.innerHTML = markup;
    instance.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    sum += totalHits;
    sum -= PER_PAGE;
  } catch (error) {
    console.log(error);
    refs.btn.style.display = 'none';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } finally {
    refs.form.reset();
    AOS.init();
  }
}
async function handleClick() {
  page += 1;
  refs.disabled = true;
  try {
    if (sum <= PER_PAGE) {
      refs.btn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    const elementsForMarkup = await takeData(inputValue);
    const markup = await createMarkup(elementsForMarkup);

    refs.gallery.insertAdjacentHTML('beforeend', markup);
    instance.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    sum -= PER_PAGE;
  } catch (error) {
    console.log(error);
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    refs.btn.style.display = 'none';
  } finally {
    refs.disabled = false;
    AOS.init();
  }
}
async function takeData(input) {
  const resp = await axios.get(
    `?key=${key}&q=${input}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`
  );
  totalHits = resp.data.totalHits;
  if (resp.data.hits.length !== 0) {
    return resp.data.hits;
  }
}
async function createMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card" data-aos="flip-left"
     data-aos-easing="ease-out-cubic"
     data-aos-duration="2000">
    <a class="photo-card-link" href="${largeImageURL}"><img class="photo-card-img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b>${downloads}</b>
    </p>
  </div>
</div>`
    )
    .join('');
}
