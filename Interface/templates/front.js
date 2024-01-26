// Function to submit all forms and log the data in JSON
function submitForms() {
   var formData = {}

    // Get the selected form
    var selectedFormId = $("#dropdownMenu").val();
    var selectedForm = $("#form" + selectedFormId);

    // Determine the type_of_request
    var typeOfRequest = selectedForm.attr('name');
    formData["type_of_request"] = typeOfRequest;

    // Iterate through form elements and collect data
    selectedForm.find(".form-group").each(function () {
        var inputId = $(this).find('input, select').prop('id');
        var inputValue = $(this).find('input, select').val();

        // Check if the element is a select dropdown with a phaseDropdown ID
        if ($(this).find('select').hasClass('custom-select')) {
            var phaseDropdownId = $(this).find('select').prop('id');
            var phaseDropdownValue = $(this).find('select').val();
            formData["phase"] = phaseDropdownValue;
        }

        formData[inputId] = inputValue;
    });

    // Add max results data
    formData["num_res"] = $("#num_res").val();

    // Log the data in JSON format
    console.log(JSON.stringify(formData));
}
