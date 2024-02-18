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
