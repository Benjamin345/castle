import './style/index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Pagination from'./pagination.js'
import hotel_resto from  './Liste-Relais-Chateau_Finale';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button} from 'reactstrap';

var accents = require('remove-accents');




function getRestaurantByName(name){
	var tab=[];
	hotel_resto.map((hotel)=>{
		if(aContainsB(accents.remove(hotel.city).toLowerCase(),accents.remove(name).toLowerCase()))
			tab.push(hotel);
		return null;
	})
	return tab;
}

function getRestaurantByAdress(city){
	var tab=[];
	hotel_resto.map((hotel)=>{
		if(aContainsB(accents.remove(hotel.city).toLowerCase(),accents.remove(city).toLowerCase()))
			tab.push(hotel);
		return null;
	})
	return tab;
}

function aContainsB (a, b) {
    return a.indexOf(b) >= 0;
}


class SearchBar extends React.Component {
	constructor(props) {
	  	super(props);

	    this.state = {value1: '', dropdownOpen: false, value2:''
      };
	    this.handleChange = this.handleChange.bind(this);
    this.handleClick=this.handleClick.bind(this);
     this.toggle = this.toggle.bind(this);
    };
  	
  	toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

	handleClick(event) {
  	 this.setState({
  	 	value1:event.target.innerText
  	 });
  	
	}
	handleChange(event) {
	    this.setState({value2: event.target.value});
	    if(this.state.value1==="Ville"){
	    	 ReactDOM.render(
	    
		  <Hotels value={getRestaurantByAdress(this.state.value2)}/>,
		  document.getElementById('root')
		);
	    }
	    if(this.state.value1==="Nom")
	    {
	    	 ReactDOM.render(
	    
		  <Hotels value={getRestaurantByName(this.state.value2)}/>,
		  document.getElementById('root')
		);
	    }
	   

 	}
  render(){
  	return (
      <form onSubmit={this.handleSubmit}>
        <div class="col-auto">
           <b>Rechercher Par:   </b>
            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        		<DropdownToggle caret color="primary">
          			{this.state.value1}
       		 </DropdownToggle>
       		 <DropdownMenu>
       		 <DropdownItem onClick={this.handleClick}>Ville</DropdownItem>
          	<DropdownItem onClick={this.handleClick}>Nom</DropdownItem>
          	</DropdownMenu>
        	</ButtonDropdown>
           </div>
           <div class="col-auto">
          <input type="text" value={this.state.value2} onChange={this.handleChange} />
          </div>
      </form>
    );
  }
}

class Hotels extends React.Component{
	render() {
		return(
			<div>
			<div class="header">
			<div class="container">
				<div class="col-sm">
						<img src={require('./style/DealToEat.jpg')} class="img-responsive " />
				</div>
	  				
	    			
	    		<div class="col-sm">
	      			 <SearchBar/>
	   			 </div>
	    		
	 		</div>
			</div>
			
			<div>
				{this.props.value.map((hotel)=>{
					return <Hotel value ={hotel}/>
					})
				}
			</div>
			</div>
		)
	}
}


class Hotel extends React.Component {
	render() {
		return (
			<div class="container">
			<br></br><br></br>
				<h2>{this.props.value.hotel_name}</h2>
					<div class="row">
						<div class="col-auto">
							<b>Chambre la moins chère :</b>
						</div>
						<div class="col-auto">
							{this.props.value.hotel_price}
						</div>
					</div>

					<div class="row">
						<div class="col-auto">
							<b>Adresse :</b>
						</div>
						<div class="col-auto">
							{this.props.value.city}
						</div>	
					</div>

					<div class="row">
      					<div class="col-auto">
							<b>Url :</b> 
						</div>
						<div class="col-auto">
							{this.props.value.url}
						</div>
					</div>
			}
				
			</div>
		)
	}
}
ReactDOM.render(
  <Hotels value={hotel_resto}/>,
  document.getElementById('root')
);