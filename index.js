/**
 * Facility that will serve as a namespace.
 * @return {function} public function renderList
 */
var module = (function(){
    var visibleTypes = ["all"],
    pokemonsList = $(".pokemonsList"),
    pokemonSelect = $(".pokemon"),
    offset = 12;

    /**
     * @param  {object} data - contains all properties as key:value
     * @param  {object} template - contains html markup
     * @return {object} view - html markup with data instead of %key%
     */
    function render(data, template){
        var view = template.html();
        var nameSpace = getNameSpace(view);
            $.each(nameSpace, function(index, value){ 
                view = view.replace("%"+value+"%", getResult(data, value));
            });
        return $(view);
    };

    /**
     * Create html markup for selected pokemon and render it
     * @param  {object} event - object with data about selected pokemon
     */
    function renderSelectPokemon(event){
        $(pokemonSelect).empty().append(render(event.data, $("#template-pokemon"))); 
            if ($(window).width() <= 991){
                $('html, body').animate({
                    scrollTop: $("#selected").offset().top
                }, 200);
            };
    };

    /**
     * Create html markup for all pokemons and render it, make event
     * @param  {string} url - data about all pokemons
     */
    function renderList(url){
        $.getJSON(url, function(data){
            var objects = data.objects;         
            $.each(objects, function(index){
                render(objects[index], $("#template-list"))
                    .on("click", objects[index], renderSelectPokemon)
                        .appendTo(pokemonsList); 
            });
        }).done(renderForm).done(filterByType).done(clearLoading);
    };

    function clearLoading(){
        $(".loading").hide();
    };

    function getTypesList(data){
        var pokeType = "";
        $.each(data.types, function(key, value){
            pokeType += "<div class='types "+ value.name + "'>" + value.name + "</div>";
            //add unique type to array for filter visible pokemons
            if(visibleTypes.indexOf(value.name) == -1) visibleTypes.push(value.name);
        });
        return pokeType;
    };

    function getTypesSelect(data){
        var arr = [];
        $.each(data.types, function(key, value){
            arr.push(value.name);
        });
        return arr.join(", ");
    };

    /**
     * @param  {object} view - html markup for template
     * @return {array} nameSpace - data names are present in this templates
     */
    function getNameSpace(view){
        var pattern = new RegExp("\%(.*?)\%", "g"),
            nameSpace = [];
        $.each(view.match(pattern), function(index,value){
            nameSpace.push(value.slice(1,-1));
        });
        return nameSpace;
    };

    /**
     * @param  {object} data - object with all data about pokemons
     * @param  {string} value - name of the current property
     * @return {string/number} value of the current property
     */
    function getResult(data, value){
        if(data[value]) return data[value];
        if(value == "totalMoves") return data.moves.length;
        if(value === "pokeType") return getTypesList(data);
        if(value === "pokeTypes") return getTypesSelect(data);
    };

    /**
     * Fill the filter form 
     */
    function renderForm(){
    $("#container-for-form").empty();
    var temp = {};  
        $.each(visibleTypes, function(index, type) {
            temp.type = visibleTypes[index];
            render(temp, $("#form-select")).appendTo("#container-for-form");
        })
    };

    /**
     * Get selected type and hide all pokemons that not have this type
     */
    function filterByType(){
        $(".each-pokemon").show();
        var formSelect = $("#container-for-form"),
            thisType = $(formSelect).find(":selected").text();
        if(thisType === "all"){
            $(".each-pokemon").show();
            return false
        };
        $.each($(".each-pokemon"),function(index, value){
            if (!$(value).find("div").hasClass(thisType)){
              $(value).hide();
            };
        });
    };

    function increaseOffset(){
        offset += 12;
    };

    function getOffset(){
        return offset;
    };

    /**
     * Handler for button "load more"
     */
    $("#loadMore").on("click", function(){
        var url = "http://pokeapi.co/api/v1/pokemon/?limit=12&offset=" + getOffset(); 
        renderList(url);
        increaseOffset();
    });

    /**
     * Handler for filter form
     */
    $(".form-control").on("change", filterByType);

    return {
        renderList: renderList,
    }

})();

$(document).ready(function(){
    module.renderList("http://pokeapi.co/api/v1/pokemon/?limit=12"); 
});