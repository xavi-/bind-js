{

}

start
	= template

template
	= head:text? rest:(bind text?)* { return Array.prototype.concat.apply([ head ], rest); }

bracket
	= "(:" / ":)"
	/ "[:" / ":]"
	/ "{:" / ":}"

bind
	= "(:" bind:bind_body ":)" { return { bind: bind }; }
	/ "[:" bind:bind_body ":]" { return { bind: bind }; }
	/ "{:" bind:bind_body ":}" { return { bind: bind }; }

bind_body
	= __ head:bind_head __ "~" templ:template { return { head: head.join(""), body: templ }; }
	/ __ head:bind_head __ { return { head: head.join("") }; }

bind_head
	= [a-z]+
	/ "`" [a-z]+ "`"

text
	= text:(!bracket !bracket char:. { return char })+ { return text.join(""); }
__
	= [ \t\n\r]*
