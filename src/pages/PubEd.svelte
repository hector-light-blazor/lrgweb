<script>
     import {  navigateTo } from '../lib/main';
     import VideoPlayer from '../components/VideoPlayer.svelte';
     let txtVideo = false;
</script>
<style>
    h1 {
        color: #2B4988;
        
    }
    h3{
        color: #2B4988;
    }
    h1 i {
        color: #707070;
    }
    .flex-container {
        max-width: 1200px;
     margin: auto;
     
     padding: 10px;
    }
    img {
       
        margin-right: 30px;
        margin-bottom: 20px;
    }
    p {
        color: #2B4988;
    }
    button {
        border-radius: 16px;
        color:white;
        background: #2B4988;
        cursor: pointer;
        text-align: center;
        width: 190px;
    }
    button:hover {
       background:rgb(12, 37, 90);
    }
    .grid-container-3 {
        display: grid;
        grid-template-columns: 45% 8% 47%;
    }
    .imgResponsive {
        width: 100%;
        height: auto;
    }
    .imgResponsive:hover {
        cursor: pointer;
    }
  
    #btnEvent{
        margin-top: 160px;
    }
    #imgCon {
        max-width: 68vh;
        height: 420px; 
        border: 1px solid #ccc!important;
        padding: 4px;       
    }
    h2:hover{
        color: rgb(226, 28, 13) !important;
        cursor: pointer;
    }
    .bannerMsg {
        color: #B39945;
        padding: 20px;
        font-weight: bold;
        font-size: 1.4rem;
    }
   
    @media only screen and (max-width: 1600px) {
     
      #imgCon {
        width: 100%;
        height: auto;
      }
      .grid-container-3 {
          display: initial;
      
      }
       .flex-container {
            max-width: 100%;
            margin: 0;
            padding: 30px;
           
        }
         #btnEvent{
        margin-top: 60px;
    }
    }
   
</style>
            
<div class="flex-container">
     <h1><b>Public Education </b><i > Program</i></h1>
    <div class="grid-container-3">
        <div>
            
                 <p >
                    We attend several events which gives us the opportunity to promote and educate the public on how to properly use the 9-1-1 system.
                
                </p>
                <p>We give presentations that local cities, school, daycares, Fire, Police Depts. and Emergency Medical Services (EMS) companies within the Hidalgo and Willacy Counties. While attending these events, our mascots (Cell Phone Sally, Josh and Keith Friendly Kid) have become a great part of our education program

                </p>
                <p>
                    Using multi-media, we demonstrate the proper way to call 9-1-1 and what is considered a 9-1-1 emergency call. Promotional item distribution is a major part of our program.
                </p>

                <div id="btnEvent">
                   <button on:click="{()=>{navigateTo("#PubEdRequest")}}">EVENT REQUEST</button>
                </div>
        </div>
        <div></div>
        <div>
              <img id="imgCon"  src="/build/assets/pages/pubed/main-photo.webp"  alt="Kids with mascot" />
        </div>
    </div>

      

        <div>
            <h3><i>Do you know how to make 9-1-1 work for you?</i></h3>
            <p>For forty years, 9-1-1 has served as the vital link between the American public and emergency services. Public education and awareness initiatives throughout the years have contributed in large measure to the incredible and ongoing success of the emergency communications system as a whole. It is imperative that 9-1-1 professionals, teachers, government officials, media representatives, and industry leaders are equipped with the tools necessary to continue these efforts in the face of an ever-changing telecommunications landscape, and that citizens of all ages are well versed in the role they play in ensuring effective and efficient emergency response for themselves and their fellow citizens.The resources below provide you with the tools necessary to educate yourself and your community on the proper use of the 9-1-1 system, no matter which side of the phone you are on.</p>

            <img  loading="lazy" class="imgResponsive" src="/build/assets/pages/pubed/karis_law_banner.jpg" alt="Kari Banner" />
            <div class="bannerMsg">
                require multi-line telephone systems to have a configuration that permits users to directly initiate 
                a call to 9-1-1 without dialing any additional digit, code, prefix, or post-fix, and for other purposes.
            </div>
            <img loading="lazy" class="imgResponsive" src="/build/assets/pages/pubed/lv_banner.jpg" alt="Lv banner" />
             <div class="bannerMsg">
                We work with other agencies such as the United States Postal Service (USPS), telephone companies and others to make sure the 9-1-1 physical address is well known.
            </div>
              
              {#if txtVideo}
                    <VideoPlayer on:click="{()=>{txtVideo = false;}}"  src="./build/assets/videos/txt_to_911.mp4" />
              {:else}
                    <img loading="lazy" on:click="{()=>{txtVideo=!txtVideo}}" class="imgResponsive" src="/build/assets/pages/pubed/text_to_911_banner.jpg" alt="TXT 911 Banner" />
              {/if}
            
            <div class="bannerMsg">
               Text-to-911 is the ability to send a text message to reach 911 emergency call takers from your mobile phone or device. However, because text-to-911 is currently only available in certain locations, you should always make a voice call to contact 911 during an emergency whenever possible.
               <br>Visit: <a target="_blank" href="https://www.congress.gov/bill/115th-congress/house-bill/582/text">https://www.congress.gov/bill/115th-congress/house-bill/582/text</a>
            </div>
            
            <div >
                <img loading="lazy" class="imgResponsive" width="850" src="/assets/jpg/team_banner.jpg" alt="Team Banner" /> 
                <h2 style="text-align: center;color: #88362E;">Click here for event information</h2>
            </div>

          
        </div>
   

</div>