# Smart Filter Documentation

The smart filter is a powerful filter that allows quick and flexible filtering of your grid. You have these filter categories available:

* Smart (default)
* Exact (to perform exact match filters)
* Number (to perform number filters)
* Regex (to perform string filters via [RegEx](https://en.wikipedia.org/wiki/Regular_expression))

Whenever the filter option is not "Smart" the filter shows that by making the border of the inputfield orange:

![Non-Default Filter](https://i.imgur.com/Vn9K7yC.png)

## Smart Option

The smart option tries to take the best filter available based on user input. If the user typed `< 5000` the resulting filter would be a number comparison. If the user typed `ber bau` the filter would match all rows that *contain* both `ber` and `bau`:

![AND-Operator](https://i.imgur.com/osq9YpL.png)

The smart option has two special operands: `.` (dot) meaning "not empty" and `!` (exclamation) meaning empty:

![AND-Operator](https://i.imgur.com/ggajkvY.png)
![OR-Operator](https://i.imgur.com/e6GwKsM.png)

These operators will work both on string and number data.

Further, the smart filter does not only support the `AND` operator (`space`), but also `OR` operations, for example you could want to show all rows having forename `bernhard` **OR** `doris` or having `DW` **OR** `UJ` as point of contact:

![OR-Operator](https://i.imgur.com/TYr8Srl.png)
![OR-Operator](https://i.imgur.com/VqUeXsE.png)

Note that (different to the Regex option) the spaces around the operator will be stripped off - `bernhard | doris` will actually perform a search for "`bernhard`" or "`doris`" and not "`bernhard` " (with trailing space) or " `doris`" (with leading space).

Combining both operations and grouping them (eg "`( joh do | foo ba )`") is currently not supported.

## Exact Option

The exact option will only match if the cell value exactly matches the search string. Compare these two results:

![Exact Option](https://i.imgur.com/fvNtVdX.png)
![Exact Option](https://i.imgur.com/8blj3p3.png)

The first one does also match `Elisabeth`, the second one does not. Note that the filter is case-insensitive!

## Number Option

For number-comparisons you can use the following operands:

* `<` (less than)
* `>` (more than)
* `<=` (less than or equal to)
* `>=` (more than or equal to)
* `=` (equal to)
* `!=` (not equal to)

![Less than](https://i.imgur.com/HlkUcoy.png)

Combination with `AND` and `OR` operators is possible, so you can filter ranges. In this example we filter all entries that are larger than 500 **AND** smaller than 1000:

![Range](https://i.imgur.com/QwImGWG.png)

You could also filter entries smaller than 500 **OR** larger than 8000:

![Range](https://i.imgur.com/hRTzOTW.png)

## Regex Option

If you still need more options to filter your date you can also use Regex to do so. Tools like [regex101](https://regex101.com/) can help you build your expression. You could for example want to show all items that have a forename ending with the string `lisa` but having at least one character before that string:

![regex](https://i.imgur.com/CroNoCW.png)

Note that this search does NOT show rows of value `Lisa`.
