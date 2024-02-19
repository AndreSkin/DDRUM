$(document).ready(function() {
    // Arrays to store drug names and condition names
    var drugNames = [];
    var conditionNames = [];
    
    // Function to fetch drug names
    $.getJSON('http://localhost:5000/drugs', function(data) {
        $.each(data.results.bindings, function(index, value) {
            drugNames.push(value.drugName.value);
        });
    });

    // Function to fetch condition names
    $.getJSON('http://localhost:5000/conditions', function(data) {
        $.each(data.results.bindings, function(index, value) {
            conditionNames.push(value.conditionName.value);
        });
    });

    // Function to display drug suggestions
    $('#drugSearch').on('input', function() {
        var userInput = $(this).val().toLowerCase();
        $('#drugSuggestions').html('');
        if (userInput.length >= 1) {
            var suggestions = drugNames.filter(function(drug) {
                return drug.toLowerCase().startsWith(userInput);
            });
            $.each(suggestions, function(index, value) {
                $('#drugSuggestions').append('<div class="suggestion">' + value + '</div>');
            });
        }
    });

    // Function to display condition suggestions
    $('#conditionSearch').on('input', function() {
        var userInput = $(this).val().toLowerCase();
        $('#conditionSuggestions').html('');
        if (userInput.length >= 1) {
            var suggestions = conditionNames.filter(function(condition) {
                return condition.toLowerCase().startsWith(userInput);
            });
            $.each(suggestions, function(index, value) {
                $('#conditionSuggestions').append('<div class="suggestion">' + value + '</div>');
            });
        }
    });

    // Clicking on drug suggestion
    $('#drugSuggestions').on('click', '.suggestion', function() {
        $('#drugSearch').val($(this).text());
        $('#drugSuggestions').html('');
    });

    // Clicking on condition suggestion
    $('#conditionSuggestions').on('click', '.suggestion', function() {
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
    $("#results").empty();
    $("#error").empty();
    var formData = {};
    var isValid = true;

    // Get the selected form
    var selectedFormId = $("#dropdownMenu").val();
    var selectedForm = $("#form" + selectedFormId);

    // Determine the type_of_request
    var typeOfRequest = selectedForm.attr('name');
    formData["type_of_request"] = typeOfRequest;

    // Iterate through form elements and collect data
    selectedForm.find(".form-group").each(function () {
        var inputValue = $(this).find('input, select').val();
        if (!inputValue) {
            $("#error").append("<br><p class='text-danger'>Please fill out all fields.</p>");
            isValid = false;
            return false;
        }

        // Check if the element is a select dropdown with a phaseDropdown ID
        if ($(this).find('select').hasClass('custom-select')) {
            var phaseDropdownValue = $(this).find('select').val();
            formData["phase"] = phaseDropdownValue;
        }

        formData["object"] = inputValue;
    });

    if (!isValid) {
        return;
    }

    // Add max results data
    let numres = $("#num_res").val();
    if(numres<=0){
        $("#error").append("<br><p class='text-danger'>Please enter a valid number of results (Min. 1).</p>");
        return;
    }
    else
    {
        formData["num_res"] = numres;
    }

    // Log the data in JSON format
    //console.log(JSON.stringify(formData));

    // Send data as a POST request
    fetch('http://localhost:5000/submit', {
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
        //console.log('Response:', response);
        var html = "<br>";
        if (response.head && response.results && response.results.bindings) {
            html += "<table class='table table-striped table-vertical-lines'><thead><tr>";
            var vars = response.head.vars;
            vars.forEach(function(variable) {
                html += "<th>" + variable + "</th>";
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
                                html += "<td>" + binding[variable].value + "</td>";
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
