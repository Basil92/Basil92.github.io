var module = (function(){
	/**
	 * [visibleTypes description]
	 * @type {Array} visibleTypes - array for filter
	 */
    var visibleTypes = ["all"],
		pokemonsList = $(".pokemonsList"),
		pokemonSelect = $(".pokemon"),
		listItemTemplate = $("#template-list-item").html(),
		selectPokemonTemplate = $("#template-select-pokemon").html(),
		formTemplate = $("#template-form-select").html(),
		offset = 12,
		loading = $(".loading");

    /**
     * @param  {object} data - contains all properties as key:value
     * @param  {string} template - html markup
     * @return {object} html markup with data instead of %key%
     */
    function render(data, template){
		$.each(data, function(index, value){
			template = template.replace(new RegExp("%"+index+"%", 'g'), value);
		});
		return $(template);
    }

    /**
     * Create html markup for selected pokemon and render it
     * @param  {object} data - object with data about selected pokemon
     */
    function renderSelectPokemon(data){
		data.totalMoves = data.moves.length;
		data.pokeTypes = getTypesSelect(data);

        $(pokemonSelect)
			.empty()
			.append(render(data, selectPokemonTemplate));

		if ($(window).width() <= 991){
			$('html, body').animate({
				scrollTop: $("#selected").offset().top
			}, 200);
		}
    }

    /**
     * Create html markup for all pokemons and render it, make event
     * @param  {string} url - data about all pokemons
     */
    function renderList(url){
        $.getJSON(url, function(data){
            var objects = data.objects;

            $.each(objects, function(index){
				objects[index].pokeType = getTypesList(objects[index]);

                render(objects[index], listItemTemplate)
                    .on("click", function() {
						renderSelectPokemon(objects[index]);
					})
					.appendTo(pokemonsList);
            });

			$(loading).hide();
			renderForm();
			filterByType();
        });
    }


    function getTypesList(data){
        var pokeType = "";

        $.each(data.types, function(key, value){
            pokeType += "<div class='types "+ value.name + "'>" + value.name + "</div>";

            //add unique type to array for filter visible pokemons
            if(visibleTypes.indexOf(value.name) == -1) {
				visibleTypes.push(value.name);
			}
        });

        return pokeType;
    }

    function getTypesSelect(data){
        var arr = [];

        $.each(data.types, function(key, value){
            arr.push(value.name);
        });

        return arr.join(", ");
    }

    /**
     * Fill the filter form
     */
    function renderForm(){
		$("#container-for-form").empty();

		$.each(visibleTypes, function(index, type) {
			render({type: type}, formTemplate).appendTo("#container-for-form");
		})
    }

    /**
     * Get selected type and hide all pokemons that not have this type
     */
    function filterByType(){
        var formSelect = $("#container-for-form"),
            thisType = $(formSelect).val(),
			allPokemons = $(".each-pokemon");

		if(thisType === "all"){
			allPokemons.show();

			return false
		}

		allPokemons.hide();

		allPokemons.each(function(index, value){
            if ($(value).find("div").hasClass(thisType)){
            	$(value).show();
            }
        });
    }

    /**
     * Handler for button "load more"
     */
    $("#loadMore").on("click", function(){
        var url = "http://pokeapi.co/api/v1/pokemon/?limit=12&offset=" + offset; 

		renderList(url);
        offset += 12;
    });

    /**
     * Handler for filter form
     */
    $("#container-for-form").on("change", filterByType);

    return {
        renderList: renderList
    }

})();

$(document).ready(function(){
    module.renderList("http://pokeapi.co/api/v1/pokemon/?limit=12"); 
});