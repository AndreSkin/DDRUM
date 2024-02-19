var server = "http://localhost:5000";
$(document).ready(function() {
    // Arrays to store drug names and condition names
    var drugNames = [];
    var conditionNames = [];
    
    // Function to fetch drug names
    $.getJSON(server+"/drugs", function(data) {
        $.each(data.results.bindings, function(index, value) {
            let drugName = value.drugName.value.charAt(0).toUpperCase() + value.drugName.value.slice(1); 
            drugNames.push(drugName);
        });
    });

    // Function to fetch condition names
    $.getJSON(server+'/conditions', function(data) {
        $.each(data.results.bindings, function(index, value) {
            let conditionName = value.conditionName.value.charAt(0).toUpperCase() + value.conditionName.value.slice(1); 
            conditionNames.push(conditionName);
        });
    });

    // Function to display drug suggestions
    $('#drugSearch').on('input', function() {
        var userInput = $(this).val().toLowerCase();
        $('#drugSuggestions').html('');
        if (userInput.length >= 1) {
            $(".scrollable-suggestions").css("border", "1px solid #ced4da");
            var suggestions = drugNames.filter(function(drug) {
                return drug.toLowerCase().startsWith(userInput);
            });
            $.each(suggestions, function(index, value) {
                $('#drugSuggestions').append('<div class="suggestion">' + value + '</div>');
            });
        }
        else {
            $(".scrollable-suggestions").css("border", "none");
        }
    });

    // Function to display condition suggestions
    $('#conditionSearch').on('input', function() {
        var userInput = $(this).val().toLowerCase();
        $('#conditionSuggestions').html('');
        if (userInput.length >= 1) {
            $(".scrollable-suggestions").css("border", "1px solid #ced4da");
            var suggestions = conditionNames.filter(function(condition) {
                return condition.toLowerCase().startsWith(userInput);
            });
            $.each(suggestions, function(index, value) {
                $('#conditionSuggestions').append('<div class="suggestion">' + value + '</div>');
            });
        }
        else {
            $(".scrollable-suggestions").css("border", "none");
        }
    });

    // Clicking on drug suggestion
    $('#drugSuggestions').on('click', '.suggestion', function() {
        $('#drugSearch').val($(this).text());
        $('#drugSuggestions').html('');
    });

    // Clicking on condition suggestion
    $('#conditionSuggestions').on('click', '.suggestion', function() {
        $(".scrollable-suggestions").css("border", "none");
        $('#conditionSearch').val($(this).text());
        $('#conditionSuggestions').html('');
    });

    // Mouse wheel scrolling for drug suggestions
    $('#drugSuggestions').on('wheel', function(e) {
        var delta = e.originalEvent.deltaY;
        this.scrollTop += (delta > 0 ? 1 : -1) * 20;
        e.preventDefault();
    });

    // Mouse wheel scrolling for condition suggestions
    $('#conditionSuggestions').on('wheel', function(e) {
        var delta = e.originalEvent.deltaY;
        this.scrollTop += (delta > 0 ? 1 : -1) * 20;
        e.preventDefault();
    });
});

function submitForms() {
    $(".scrollable-suggestions").css("border", "none");
    $('#conditionSuggestions').html('');
    $('#drugSuggestions').html('');
    $("#results").empty();
    $("#error").empty();
    var formData = {};
    var isValid = true;

    // Get the selected form
    var selectedValue = $("#dropdownMenu").val();
    let requests = ["","Mdrug_cond", "drug_cond", "Pstud_drug", "Pstud_cond", "stud_drug", "stud_cond"];

    // Determine the type_of_request
    formData["type_of_request"] = requests[parseInt(selectedValue)];

    // Toggle visibility of drugSearch and conditionSearch inputs based on selected value
    if (selectedValue === "3" || selectedValue === "5") {
        formData["object"] = $("#drugSearch").val();
    } else {
        formData["object"] = $("#conditionSearch").val();
    }

    // Check if the phase dropdown is visible and get its value
    if ($("#phaseDropdownContainer").is(":visible")) {
        formData["phase"] = $("#phaseDropdown_d1").val();
    }

    // Add max results data
    let numres = $("#num_res").val();
    if (numres <= 0) {
        $("#error").append("<br><p class='text-danger'>Please enter a valid number of results (Min. 1).</p>");
        return;
    } else {
        formData["num_res"] = numres;
    }
    // console.log(JSON.stringify(formData));

    // Send data as a POST request
    fetch(server+'/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(response => {
        var html = "<br>";
        if (response.head && response.results && response.results.bindings) {
            html += "<table class='table table-striped table-vertical-lines'><thead><tr>";
            var vars = response.head.vars;
            vars.forEach(function(variable) {
                html += `<th>` + variable.charAt(0).toUpperCase() + variable.slice(1) + "</th>";
            });
            html += "</tr></thead><tbody>";
            var bindings = response.results.bindings;
            if (bindings.length > 0) {
                bindings.forEach(function(binding) {
                    html += "<tr>";
                    vars.forEach(function(variable) {
                        if (binding[variable]) {
                            if (binding[variable].type === "uri") {
                                html += "<td><a href='" + binding[variable].value + "' target='_blank'>" + binding[variable].value + "</a></td>";
                            } else {
                                let result = binding[variable].value
                                html += "<td>" + result.charAt(0).toUpperCase() + result.slice(1) + "</td>";
                            }
                        } else {
                            html += "<td></td>";
                        }
                    });
                    html += "</tr>";
                });
                html += "</tbody></table>";
            } else {
                html = "<br><p>No result found</p>";
            }
        } else {
            html += "<p>Unexpected response format.</p>";
        }
        $("#results").append(html);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

