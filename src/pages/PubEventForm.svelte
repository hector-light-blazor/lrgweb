<script>
    import EventRequest from "../components/PubEdForm/EventRequest.svelte";
    import NoteEventRequest from "../components/PubEdForm/NoteEventRequest.svelte";
    let notes = ["All Public Event Requests must be submitted to LRGVDC at a minimum of 14 business day prior to your event.",
        "Requests between the 14 day period will not be accepted by the online system.",
        "If you are experiencing problems with your online request please call us directly at (956) 682-3481 ext. 150"
    ]
</script>
<style>
    .grid-container {
        display: grid;
        height: 90%;
        grid-template-columns: auto auto auto;
       
    }
h1{
    text-decoration: underline;
    color: #263E70;
    text-align: center;
    margin-bottom: 8px;
}
h3{
  text-decoration: underline;
  color: #BB2026;
  
  
}
.img {
    width: 350;
    height: 90vh; 
}
</style>

<div class="grid-container">
    <div class="grid-item">
       
    </div>
    <div class="grid-item">
        <h1>Event Request</h1>
        <NoteEventRequest title="Note" {notes} />
        <h3 style="text-align: center; color: #263E70;cursor: pointer;"><img width="18" height="18" src="/assets/png/calendar.png" alt="Calendar" />Click to view scheduled events</h3>
        <EventRequest />     
    </div>
    <div class="grid-item">
        
    </div>
</div>
