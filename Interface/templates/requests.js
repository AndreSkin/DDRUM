function submitForm() {
    var inputData = $('#input_data').val();

    $.ajax({
        type: 'POST',
        url: '/submit',
        data: { 'input_data': inputData },
        success: function (response) {
            var drugName = response.results.bindings[0].drugName.value;
            var drugURL = response.results.bindings[0].drug.value;
            var studyCount = response.results.bindings[0].studyCount.value;

            // Update the HTML with the received data
            $('#result').html(`
                <strong>Drug Name:</strong> ${drugName}<br>
                <strong>Drug URL:</strong> <a href="${drugURL}" target="_blank">${drugURL}</a><br>
                <strong>Study Count:</strong> ${studyCount}
            `);
        }
    });

}