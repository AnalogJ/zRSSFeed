##zRSSFeed
========

zRSSFeed by Zazar, modified to support multiple RSS Feeds

##Getting Started
First include the jQuery and zRSSFeed libraries.

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.0/jquery.min.js" type="text/javascript"></script>
    <script src="jquery.zrssfeed.min.js" type="text/javascript"></script>

Add a DIV tag where you wish the feed to display and give it an ID. There is no need to specify a class, this will be added.

    <div id="test"></div>

Now add the script to call the zRSSFeed plugin with the RSS URL and any options. Our example gets 5 feeds from the Reuters site.

    <script type="text/javascript">
        $(document).ready(function () {
            $('#test').rssfeed('http://feeds.reuters.com/reuters/oddlyEnoughNews', {
                limit: 5
            });
        });
    </script>

##Parameters
| Parameter | Required | Description
| ----- |-----| ----- | 
|url | Yes | The complete URL to the RSS feed ie http://feeds.reuters.com/reuters/oddlyEnoughNews |
| options | No | Optional settings for the plug-in (see below).|
|fn	| No | Optional user callback function which is called after feeds are successfully loaded.

##Plug-in Options
|Parameter | Default | Description
| ----- | ----- | ----- |
| limit | 10 | The number of feeds to return.
| header | true | If true, includes the header section containing the feed name and link.
| titletag | h4 | Specifies the HTML tag for the feed title.
| date | true | If true includes the feed date section.
| content | true | If true includes the feed description.
| snippet | true | If true the snippet short description is shown available when available.
| media | true | If true displays media items when available.
| showerror | true | If true and an error is returned from the Google Feeds API, the error message is shown.
| errormsg | - |Replaces the default friendly message when an error occurs.
| key | null | Optionally use a Google API key.
| ssl | false | Support for SSL. Set to True when using secure pages.
| linktarget | _self | Specifies the target for all feed links ('_blank', '_self', '_top', framename).
| sort | - | Sorts the feed items by either 'title' or 'date'. Leave empty for no sorting.
| sortasc | true | Specifies the sort direction, either ascending (true) or descending (false).