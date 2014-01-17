fs = require('fs')



## Overrides the standard assertion processor in order to insert HTML output. 
## Don't worry, the standard processor is invoked as well. 
casper.test._processAssertionResult = casper.test.processAssertionResult
casper.test.processAssertionResult = (result) -> 
  casper.test._processAssertionResult result
  
  if result.success
    result_class = 'success'
    status = "Passed"
  else if !result.success? 
    result_class = 'skip'
    status = "Skipped"
  else if !result.success
    result_class = 'failure'
    status = "FAILED!"
  
  wrap = "<div class='result_wrap #{result_class}'>\n"
  wrap += "<span class='result'>#{status}</span> <span class='message'>#{result.standard} => #{result.message}</span>\n"
  wrap += "</div>\n"

  casper.writeHTML wrap

  result

## Takes a screenshot of the given selector and outputs results to HTML
casper.HTMLCapture = (selector = 'body', options = {}) ->
  options.sizes ?= [ [1200, 900], [600, 500], [1024, 768] ]

  wrap = "<div class='screenshots'>"
  for [width, height] in options.sizes
    @viewport width, height
    fname = "#{Date.now()}-#{width}x#{height}.png"
    @captureSelector "#{casper.cli.options.htmlout}/screen_captures/#{fname}", selector
    wrap += "<a href='screen_captures/#{fname}'><img src='screen_captures/#{fname}'></a>"
  
  if options.caption?
    wrap += "<span class='capture_caption'>Caption: #{options.caption}</span>"      
  
  wrap += "</div>"

  casper.writeHTML wrap

casper.writeHTML = (html) ->
  f = casper.getHTMLOutput()
  f.write html
  f.close()

casper.getHTMLOutput = ->
  fs.open "#{casper.cli.options.htmlout}/index.html", 'a+'

