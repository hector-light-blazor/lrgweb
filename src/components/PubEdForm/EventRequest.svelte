<script>
  import {  fly } from 'svelte/transition';
 
  import ButtonNext from "./ButtonNext.svelte";
  import CalendarPicker from "./CalendarPicker.svelte";
  let selectedIndex = 0;
  let event_name = "";
  let from_date = "";
  let to_date = "";
  let address = "";
  let setup_time = "";
  let event_start = "";
  let event_end = "";
  let fileName = "";
  let files;
  function handleFile(e) {
    const target = e.target || e.srcElement;
    var found = false;
    for(var file of target.files){
      files = file;
      fileName = file.name;
      let name = file.name.toLowerCase();
      if(!name.includes(".pdf")) {
        alert("Please attach pdf only");
        found = true;
        break;
      }
    }
    if(found) {
      target.value = "";
    }
  }
</script>
<style>
  #form {
    position: relative;
    left: 50%;
    margin-left: -40%;
    width: 80%; height: auto; border-radius: 20px;background: #F5F5F5;
    margin-bottom: 14px;
  }
  ul.horizontal-list {
    min-width: 696px;
    list-style: none;
	
	}
	ul.horizontal-list li {
		  display: inline;
        cursor: pointer;
        padding: 40px;
	}
    button {
      height: 30px;
      width: 30px;
      border-radius: 50%;
      cursor: pointer;
    }
    .active {
        color: white;
        background: #2E3257;
    }
    .container {
      display: grid;
      grid-template-columns: 10% 80% 10%;
      padding: 10px;
    }
    select, input {
      width: 100%;
    }
  
    label {
      font-weight:bold
    }
    .text-muted {
      color: #6c757d!important;
    }
    h3
    {
      text-align: center;
    }
</style>
<div id="form">
                 <div style="height: 20px; width: 100%; border-top-left-radius: 20px; border-top-right-radius:20px;background: #2E3257; ">
                 </div>
                 <ul class="horizontal-list">
                    <li><button on:click="{() =>{selectedIndex = 0; }}" class:active={selectedIndex == 0}>1</button> EVENT INFORMATION</li>
                    <li><button on:click="{() =>{selectedIndex = 1;}}" class:active={selectedIndex == 1}>2</button> CONTACT INFORMATION</li>
                    <li><button on:click="{() =>{selectedIndex = 2;}}" class:active={selectedIndex == 2}>3</button> ADDITIONAL INFORMATION</li>
                 </ul>
                 <form>
                    <div class="container">
                        <div class="row"></div>
                        <div class="row">

                       
                        {#if (selectedIndex == 0)}
                            <div id="wrapper" transition:fly="{{ x: 200, duration: 200 }}" > 
                              <div class="group">
                                  <label>Event Name:</label>
                                  <input bind:value={event_name} type="text" />
                              </div>

                              <div class="group">
                                  <label>From Date:</label>
                                  <input bind:value={from_date} type="text" />
                                  <small id="dateHelp" class="form-text text-muted">The event needs to be 14 business day or more in advance.</small>
                              </div>

                              <div class="group">
                                  <label>To Date:</label>
                                  <input bind:value={to_date} type="text" />
                                  
                              </div>

                              <div class="group">
                                  <label>Address of Event:</label>
                                  <input bind:value={address} type="text" />
                              </div>

                              <div class="group">
                                  <label>Setup Time:</label>
                                  <select bind:value={setup_time} name="StpTime" class="form-control" id="StpTime" required="">
                                        <option></option>
                                        <option>5:00 AM</option>
                                        <option>5:30 AM</option>
                                        <option>6:00 AM</option>
                                        <option>6:30 AM</option>
                                        <option>7:00 AM</option>
                                        <option>7:30 AM</option>
                                        <option>8:00 AM</option>
                                        <option>8:30 AM</option>
                                        <option>9:00 AM</option>
                                        <option>9:30 AM</option>
                                        <option>10:00 AM</option>
                                        <option>10:30 AM</option>
                                        <option>11:00 AM</option>
                                        <option>11:30 AM</option>
                                        <option>12:00 PM</option>
                                        <option>12:30 PM</option>
                                        <option>1:00 PM</option>
                                        <option>1:30 PM</option>
                                        <option>2:00 PM</option>
                                        <option>2:30 PM</option>
                                        <option>3:00 PM</option>
                                        <option>3:30 PM</option>
                                        <option>4:00 PM</option>
                                        <option>4:30 PM</option>
                                        <option>5:00 PM</option>
                                        <option>5:30 PM</option>
                                        <option>6:00 PM</option>
                                        <option>6:30 PM</option>
                                        <option>7:00 PM</option>
                                        <option>7:30 PM</option>
                                        <option>8:00 PM</option>
                                        <option>8:30 PM</option>
                                        <option>9:00 PM</option>
                                        <option>9:30 PM</option>
                                        <option>10:00 PM</option>
                                        <option>10:30 PM</option>
                                        <option>11:00 PM</option>
                                        <option>11:30 PM</option>
                                        <option>12:00 AM</option>
                                        <option>12:30 AM</option>
                                  </select>
                              </div>

                              <div class="group">
                                  <label>Event Start Time:</label>
                                  <select bind:value={event_start} name="StpTime" class="form-control" id="StpTime" required="">
                                        <option></option>
                                        <option>5:00 AM</option>
                                        <option>5:30 AM</option>
                                        <option>6:00 AM</option>
                                        <option>6:30 AM</option>
                                        <option>7:00 AM</option>
                                        <option>7:30 AM</option>
                                        <option>8:00 AM</option>
                                        <option>8:30 AM</option>
                                        <option>9:00 AM</option>
                                        <option>9:30 AM</option>
                                        <option>10:00 AM</option>
                                        <option>10:30 AM</option>
                                        <option>11:00 AM</option>
                                        <option>11:30 AM</option>
                                        <option>12:00 PM</option>
                                        <option>12:30 PM</option>
                                        <option>1:00 PM</option>
                                        <option>1:30 PM</option>
                                        <option>2:00 PM</option>
                                        <option>2:30 PM</option>
                                        <option>3:00 PM</option>
                                        <option>3:30 PM</option>
                                        <option>4:00 PM</option>
                                        <option>4:30 PM</option>
                                        <option>5:00 PM</option>
                                        <option>5:30 PM</option>
                                        <option>6:00 PM</option>
                                        <option>6:30 PM</option>
                                        <option>7:00 PM</option>
                                        <option>7:30 PM</option>
                                        <option>8:00 PM</option>
                                        <option>8:30 PM</option>
                                        <option>9:00 PM</option>
                                        <option>9:30 PM</option>
                                        <option>10:00 PM</option>
                                        <option>10:30 PM</option>
                                        <option>11:00 PM</option>
                                        <option>11:30 PM</option>
                                        <option>12:00 AM</option>
                                        <option>12:30 AM</option>
                                  </select>
                              </div>

                              <div class="group">
                                  <label>Event End Time:</label>
                                  <select bind:value={event_end} name="StpTime" class="form-control" id="StpTime" required="">
                                        <option></option>
                                        <option>5:00 AM</option>
                                        <option>5:30 AM</option>
                                        <option>6:00 AM</option>
                                        <option>6:30 AM</option>
                                        <option>7:00 AM</option>
                                        <option>7:30 AM</option>
                                        <option>8:00 AM</option>
                                        <option>8:30 AM</option>
                                        <option>9:00 AM</option>
                                        <option>9:30 AM</option>
                                        <option>10:00 AM</option>
                                        <option>10:30 AM</option>
                                        <option>11:00 AM</option>
                                        <option>11:30 AM</option>
                                        <option>12:00 PM</option>
                                        <option>12:30 PM</option>
                                        <option>1:00 PM</option>
                                        <option>1:30 PM</option>
                                        <option>2:00 PM</option>
                                        <option>2:30 PM</option>
                                        <option>3:00 PM</option>
                                        <option>3:30 PM</option>
                                        <option>4:00 PM</option>
                                        <option>4:30 PM</option>
                                        <option>5:00 PM</option>
                                        <option>5:30 PM</option>
                                        <option>6:00 PM</option>
                                        <option>6:30 PM</option>
                                        <option>7:00 PM</option>
                                        <option>7:30 PM</option>
                                        <option>8:00 PM</option>
                                        <option>8:30 PM</option>
                                        <option>9:00 PM</option>
                                        <option>9:30 PM</option>
                                        <option>10:00 PM</option>
                                        <option>10:30 PM</option>
                                        <option>11:00 PM</option>
                                        <option>11:30 PM</option>
                                        <option>12:00 AM</option>
                                        <option>12:30 AM</option>
                                  </select>
                              </div>
                              <div class="group">
                                  {#if fileName}
                                     <!-- content here -->
                                     <label>{fileName}</label>
                                  {:else}
                                     <label>Please attach event flier. (Only PDF)</label>
                                     <input  accept="application/pdf" on:change={handleFile} type="file" />
                                  {/if}
                                  
                              </div>
                           </div>
                        {:else if  selectedIndex == 1}
                            <h3>Main Contact</h3>
                           <div id="wrapper" transition:fly="{{ x: 200, duration: 200 }}" > 
                              <div class="group">
                                  <label>First Name:</label>
                                  <input type="text" />
                              </div>

                              <div class="group">
                                  <label>Last Name:</label>
                                  <input type="text" />
                                  
                              </div>

                              <div class="group">
                                  <label>Phone Number:</label>
                                  <input type="text" />
                              </div>
                               <div class="group">
                                  <label>E-mail:</label>
                                  <input type="email" />
                              </div>
                            </div>

                            <h3>Alternate Contact</h3>
                           <div id="wrapper" transition:fly="{{ x: 200, duration: 200 }}" > 
                              <div class="group">
                                  <label>First Name:</label>
                                  <input type="text" />
                              </div>

                              <div class="group">
                                  <label>Last Name:</label>
                                  <input type="text" />
                                  
                              </div>

                              <div class="group">
                                  <label>Phone Number:</label>
                                  <input type="text" />
                              </div>
                               <div class="group">
                                  <label>E-mail:</label>
                                  <input type="email" />
                              </div>
                            </div>
                        {:else if selectedIndex == 2} 
                          <div id="wrapper">
                              <div class="group">
                                <label>Will Identification be required to enter premises?</label>
                                <select name="" id="">
                                  <option ></option>
                                  <option>Yes</option>
                                  <option>No</option>
                                </select>
                              </div>
                              <div class="group">
                                  <label >Will this be an Indoor/OutDoor Event</label>
                                  <select>
                                    <option></option>
                                    <option>Indoor</option>
                                    <option>Outdoor</option>
                                  </select>
                              </div>
                          </div>
                        {/if}

                        

                            <ButtonNext on:click="{()=>{(selectedIndex < 3) ? selectedIndex++ : "";}}" float="right" lbl="{(selectedIndex < 2) ? "Next" : "Finish"}" />
                        </div>
                        <div class="row"></div>
                    </div>
                 </form>
            </div>