import './App.css';
import ImageSlider from './components/ImageSlider';
import img0 from './images/0.jpg';
import img1 from './images/1.jpg';
import img2 from './images/2.jpg';
import img3 from './images/3.jpg';

function App() {
  const fixedCanvasWidth = 640;
  const fixedCanvasHeight = 400;
  const images = [img0, img1, img2, img3];

  return (
    <div className='App'>
      <header>
        <h1>Publitas Frontend Code Challenge</h1>
      </header>
      <section className='slider_container'>
        <ImageSlider
          fixedCanvasWidth={fixedCanvasWidth}
          fixedCanvasHeight={fixedCanvasHeight}
          images={images}
        />
        <aside>Drag to change image</aside>
      </section>
    </div>
  );
}

export default App;
