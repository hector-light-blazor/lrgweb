<script>
   
    export let cardHeight = 400;
    export let cardWidth = 400;
    export let cardRadius = 0;
    export let name;
    export let email;
 
    export let office;
    export let title = "Insert Title";
    export let photoHeight = "300px";
    export let photo = "https://images.pexels.com/photos/3526416/pexels-photo-3526416.jpeg";

   

</script>
<style>

    h2{
        text-align: center;
       
    }
    .small-line{

        line-height: 2px;
    }
    a{
        color: white;
    }
    #title{
        position: relative;
        bottom: 23px;
        color: white;
        height: 132px;
        background: rgba(20, 57, 117, 1);
    }

    #photo{
        height: 435px;
        padding: 16px;
        text-align: center;
        background: rgba(20, 57, 117, 1);
        border: 6px solid rgba(255, 255, 255, 0.685);
       
    }

    img{
        border: 2px solid #ccc!important;
    }
</style>

<div id="card" style="border-raidus:{cardRadius};height: {cardHeight}px; width: {cardWidth}px;">
    <div id="photo"  >
        <img src="{photo}" loading="lazy" alt="Stock" style="width: 80%; height:{photoHeight};object-fit:cover;">
        <div id="title">
             <h2>{name}</h2>
             <h2 class="small-line">{title}</h2>
             <p><a href="mailto:{email}">{email}</a></p>
             <h2 class="small-line">{office}</h2>
        </div>
       
    </div>
</div>