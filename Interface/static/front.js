function submitForms() {
    $("#results").empty();
    var formData = {};

    // Get the selected form
    var selectedFormId = $("#dropdownMenu").val();
    var selectedForm = $("#form" + selectedFormId);

    // Determine the type_of_request
    var typeOfRequest = selectedForm.attr('name');
    formData["type_of_request"] = typeOfRequest;

    // Iterate through form elements and collect data
    selectedForm.find(".form-group").each(function () {
        var inputValue = $(this).find('input, select').val();

        // Check if the element is a select dropdown with a phaseDropdown ID
        if ($(this).find('select').hasClass('custom-select')) {
            var phaseDropdownValue = $(this).find('select').val();
            formData["phase"] = phaseDropdownValue;
        }

        formData["object"] = inputValue;
    });

    // Add max results data
    formData["num_res"] = $("#num_res").val();

    // Log the data in JSON format
    console.log(JSON.stringify(formData));

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
        console.log('Response:', response);
        var html = "<h2>Query Results</h2>";
        if (response.head && response.results && response.results.bindings) {
            var bindings = response.results.bindings;
            if (bindings.length > 0) {
                html += "<ul>";
                bindings.forEach(function(binding) {
                    for (var key in binding) {
                        if (binding.hasOwnProperty(key)) {
                            html += "<li>" + key + ": " + binding[key].value + "</li>";
                        }
                    }
                });
                html += "</ul>";
            } else {
                html += "<p>No results found.</p>";
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
