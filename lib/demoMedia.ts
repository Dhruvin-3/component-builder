function demoImage(seed: string, title: string, description: string, id: number) {
  const src = `https://picsum.photos/seed/${seed}/600/400`;
  const thumb = `https://picsum.photos/seed/${seed}/300/200`;
  return {
    id,
    src,
    url: src,
    image: src,
    imageUrl: src,
    imageSrc: src,
    coverImage: src,
    featuredImage: src,
    photo: src,
    thumbnail: thumb,
    poster: src,
    alt: title,
    title,
    name: title,
    description,
    caption: description,
  };
}

export const DEMO_IMAGES = [
  demoImage("mountain", "Mountain Vista", "Snow-capped mountains at sunrise", 1),
  demoImage("forest", "Forest Path", "Sunlight through tall trees", 2),
  demoImage("beach", "Ocean Beach", "Turquoise water and white sand", 3),
  demoImage("valley", "Misty Valley", "Fog rolling over green hills", 4),
];

const PRIMARY_IMAGE = DEMO_IMAGES[0];

export const DEMO_VIDEOS = [
  {
    id: 1,
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: PRIMARY_IMAGE.src,
    thumbnail: PRIMARY_IMAGE.thumbnail,
    alt: "Flower blooming timelapse",
    title: "Flower Bloom",
    name: "Flower Bloom",
    description: "Demo video — flower opening",
    caption: "Demo video — nature",
    type: "video",
  },
  {
    id: 2,
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: DEMO_IMAGES[1].src,
    thumbnail: DEMO_IMAGES[1].thumbnail,
    alt: "Campfire flames",
    title: "Campfire",
    name: "Campfire",
    description: "Demo video — outdoor scene",
    caption: "Demo video — adventure",
    type: "video",
  },
  {
    id: 3,
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: DEMO_IMAGES[2].src,
    thumbnail: DEMO_IMAGES[2].thumbnail,
    alt: "Travel escape",
    title: "Travel Escape",
    name: "Travel Escape",
    description: "Demo video — travel highlight",
    caption: "Demo video — travel",
    type: "video",
  },
];

export const DEMO_MEDIA = [...DEMO_IMAGES, ...DEMO_VIDEOS];

export function buildPreviewPropsJson(): string {
  const products = DEMO_IMAGES.map((img, i) => ({
    ...img,
    price: `$${(29 + i) * 10}`,
    rating: 4.5,
  }));

  const imageUrls = DEMO_IMAGES.map((img) => img.src);
  const videoUrls = DEMO_VIDEOS.map((vid) => vid.src);

  const cardData = {
    image: PRIMARY_IMAGE.src,
    imageUrl: PRIMARY_IMAGE.src,
    imageSrc: PRIMARY_IMAGE.src,
    coverImage: PRIMARY_IMAGE.src,
    thumbnail: PRIMARY_IMAGE.thumbnail,
    title: "Sample Title",
    subtitle: "Sample Subtitle",
    description: "This is sample description text for the preview.",
    alt: PRIMARY_IMAGE.alt,
  };

  return JSON.stringify({
    images: DEMO_IMAGES,
    image: PRIMARY_IMAGE.src,
    imageUrl: PRIMARY_IMAGE.src,
    imageSrc: PRIMARY_IMAGE.src,
    coverImage: PRIMARY_IMAGE.src,
    featuredImage: PRIMARY_IMAGE.src,
    photo: PRIMARY_IMAGE.src,
    img: PRIMARY_IMAGE.src,
    imageItem: PRIMARY_IMAGE,
    imageUrls,
    urls: imageUrls,
    srcs: imageUrls,
    items: DEMO_MEDIA,
    data: DEMO_MEDIA,
    posts: DEMO_IMAGES,
    cards: DEMO_IMAGES,
    card: cardData,
    photos: DEMO_IMAGES,
    gallery: DEMO_MEDIA,
    media: DEMO_MEDIA,
    videos: DEMO_VIDEOS,
    video: DEMO_VIDEOS[0].src,
    videoItem: DEMO_VIDEOS[0],
    videoUrls,
    videoSrc: DEMO_VIDEOS[0].src,
    videoUrl: DEMO_VIDEOS[0].src,
    poster: PRIMARY_IMAGE.src,
    thumbnail: PRIMARY_IMAGE.thumbnail,
    products,
    title: "Sample Title",
    subtitle: "Sample Subtitle",
    description: "This is sample description text for the preview.",
    label: "Click me",
    text: "Sample text",
    name: "Sample Name",
    href: "#",
    src: PRIMARY_IMAGE.src,
    alt: PRIMARY_IMAGE.alt,
    className: "",
    children: "Sample content",
  });
}
