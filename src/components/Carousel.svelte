
<script>
     import {onMount} from "svelte";
     import { Link } from '../lib/main';
     import Swiper from "swiper";

     let controll;
     onMount(() => {
         var swiper = new Swiper(controll, {
            slidesPerView: 1,
            spaceBetween: 4,
            loop: true,
            autoplay: {
                delay: 5000,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            });
     });

    
</script>

<style>
    .swiper-container {
      margin-top: 10px;
      width: 100%;
      height: 100%;
      border: 0px 5px solid #ddd;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 20px;
    }
    .swiper-slide {
      text-align: center;
      font-size: 18px;
      background: #fff;

      /* Center slide text vertically */
    
    }

    .clickable {
        cursor: pointer;
    }

    img {
    max-width: 98%;
    max-height: 100%;
    border: 1px solid #ccc!important;
    padding: 4px;
}

</style>
<div bind:this={controll}  class="swiper-container">
    <div class="swiper-wrapper">

     <div class="swiper-slide">
                
            <Link href="#PubEdRequest">
                 <img loading="lazy"  class="clickable" alt="PUB"
        src="./build/assets/carousel/event_banner.png" />

            </Link>
               
      </div>
       <div class="swiper-slide">
                <img loading="lazy" alt="Training"
        src="./build/assets/carousel/training_banner.png" />
      </div>

      <div class="swiper-slide">
                <img loading="lazy" alt="Training"
        src="./build/assets/carousel/911tips_banner.png" />
      </div>

      <div class="swiper-slide">
                <img loading="lazy" alt="Karis"
        src="./build/assets/carousel/karislaw_banner.png" />
      </div>

      <div class="swiper-slide">
                <img loading="lazy" alt="PUB"
        src="./build/assets/carousel/pubed_banner.png" />
      </div>
     
    </div>
    <!-- Add Pagination -->
    <div class="swiper-pagination"></div>
    <!-- Add Arrows -->
    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
  </div>
