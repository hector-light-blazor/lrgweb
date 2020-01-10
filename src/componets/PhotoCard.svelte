<script>
    export let cardHeight = 400;
    export let cardWidth = 400;
    export let cardRadius = 0;
    export let title = "Insert Title";
    export let photoHeight = "auto";
    export let photo = "https://images.pexels.com/photos/3526416/pexels-photo-3526416.jpeg";
</script>
<style>
    #card {
        border: 8px solid rgba(255, 255, 255, 0.685);
        box-shadow: 6px 6px 2px 1px rgba(0, 0, 0, 0.356);
    }

    h2{
        text-align: center;
    }
    #title{
        position: relative;
        bottom: 25px;
    }

    #msg {
        text-align: center;
        word-wrap: break-word;
    }
  
</style>

<div id="card" style="border-raidus:{cardRadius};height: {cardHeight}px; width: {cardWidth}px;">
    <div id="photo"  >
        <img src="{photo}" alt="Stock" style="width: 100%; height:{photoHeight};object-fit:cover;">
        <div id="title">
             <h2>{title}</h2>
        </div>
       
    </div>

    <div id="msg">
        Location Validation has been around since 200b.c.
        What Can we say about the species themselves.
        I felt compelled by them
    </div>

</div>