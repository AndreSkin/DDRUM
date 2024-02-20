var server = "http://localhost:5000";

class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node != null && node.isEndOfWord;
    }

    getWordsWithPrefix(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this._getAllWordsFromNode(node, prefix);
    }

    _getAllWordsFromNode(node, prefix) {
        let words = [];
        if (node.isEndOfWord) {
            words.push(prefix);
        }
        for (let char in node.children) {
            words = words.concat(this._getAllWordsFromNode(node.children[char], prefix + char));
        }
        return words;
    }
}


$(document).ready(function() {
    // Trie to store drug names and condition names
    var drugTrie = new Trie();
    var conditionTrie = new Trie();
    
    // Function to fetch drug names and populate the trie
    $.getJSON(server+"/drugs", function(data) {
        $.each(data.results.bindings, function(index, value) {
            let drugName = value.drugName.value.charAt(0).toUpperCase() + value.drugName.value.slice(1); 
            drugTrie.insert(drugName.toLowerCase());
        });
    });

    // Function to fetch condition names and populate the trie
    $.getJSON(server+'/conditions', function(data) {
        $.each(data.results.bindings, function(index, value) {
            let conditionName = value.conditionName.value.charAt(0).toUpperCase() + value.conditionName.value.slice(1); 
            conditionTrie.insert(conditionName.toLowerCase());
        });
    });

    // Function to display suggestions
    function displaySuggestions(input, trie, suggestionsContainer) {
        suggestionsContainer.html('');
        if (input.length >= 1) {
            $(".scrollable-suggestions").css("border", "1px solid #ced4da");
            var suggestions = trie.getWordsWithPrefix(input.toLowerCase());
            suggestions.sort(); // Sort the suggestions alphabetically
            $.each(suggestions, function(index, value) {
                suggestionsContainer.append('<div class="suggestion">' + value + '</div>');
            });
        }
        else {
            $(".scrollable-suggestions").css("border", "none");
        }
    }
    

    // Function to handle input for drug search
    $('#drugSearch').on('input', function() {
        var userInput = $(this).val();
        displaySuggestions(userInput, drugTrie, $('#drugSuggestions'));
    });

    // Function to handle input for condition search
    $('#conditionSearch').on('input', function() {
        var userInput = $(this).val();
        displaySuggestions(userInput, conditionTrie, $('#conditionSuggestions'));
    });

    // Clicking on suggestion for drug search
    $('#drugSuggestions').on('click', '.suggestion', function() {
        $('#drugSearch').val($(this).text());
        $('#drugSuggestions').html('');
    });

    // Clicking on suggestion for condition search
    $('#conditionSuggestions').on('click', '.suggestion', function() {
        $(".scrollable-suggestions").css("border", "none");
        $('#conditionSearch').val($(this).text());
        $('#conditionSuggestions').html('');
    });

});


function submitForms() {
    $(".scrollable-suggestions").css("border", "none");
    $('#conditionSuggestions').html('');
    $('#drugSuggestions').html('');
    $("#results").empty().attr("aria-busy", "true").attr("aria-live", "polite").attr("aria-atomic", "true");
    $("#error").empty();
    var formData = {};

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
            html += "<table class='table table-striped table-vertical-lines' role='table'><thead><tr>";
            var vars = response.head.vars;
            vars.forEach(function(variable) {
                html += `<th scope='col'>` + variable.charAt(0).toUpperCase() + variable.slice(1) + "</th>";
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
        $("#results").empty().append(html).removeAttr("aria-busy").removeAttr("aria-live").removeAttr("aria-atomic");
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
