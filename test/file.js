module.exports = {
    "default": {
        "foo": "bar",
        "test": "'123'"
    },
    "section": {
        "foo": "bar ; wrong comment",
        "error": {
            "404": "\\\"page not found\\\"",
            "500": "application error"
        }
    },
    "test": {
        "foo": "baz",
        "error": {
            "404": "\\\"page not found\\\"",
            "500": "application error"
        },
        "arr": [23, 42, 55]
    },
    "third": {
        "foo": "baz",
        "error": {
            "404": "\\\"page not found\\\"",
            "500": "application error"
        },
        "arr": [23, 42, 55],
        "toto": "\"tata\""
    }
};
