
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
      width: 100%;
      height: 100%;
      margin-left: auto;
      margin-right: auto;
    }
    .swiper-slide {
      text-align: center;
      font-size: 18px;
      background: #fff;

      /* Center slide text vertically */
      display: -webkit-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-align-items: center;
      align-items: center;
    }

    .clickable {
        cursor: pointer;
    }

</style>
<br />
<div bind:this={controll}  class="swiper-container">
    <div class="swiper-wrapper">

     <div class="swiper-slide">
                
            <Link href="#PubEdRequest">
                 <img  class="clickable" alt="PUB"
        src="./build/assets/carousel/event_banner.png" />

            </Link>
               
      </div>
       <div class="swiper-slide">
                <img alt="Training"
        src="./build/assets/carousel/training_banner.png" />
      </div>

      <div class="swiper-slide">
                <img alt="Training"
        src="./build/assets/carousel/911tips_banner.png" />
      </div>

      <div class="swiper-slide">
                <img alt="PUB"
        src="./build/assets/carousel/pubed_banner.png" />
      </div>
     
    </div>
    <!-- Add Pagination -->
    <div class="swiper-pagination"></div>
    <!-- Add Arrows -->
    <div class="swiper-button-next"></div>
    <div class="swiper-button-prev"></div>
  </div>
