#Redis Multiplexer
This library is an attempt to create some kind of multiplexer to build a
multi-master setup for redis. We are encountering the problem to have two data-
centers and two write masters with their corresponding slaves.

The multiplexer should run once for each location that has a preferred master
to write to and it should declare it as primary.

## Concept
The concept is simple. The multiplexer opens connections to all given servers.
The primary connection is held separate, the other ones are managed by a simple
list.

The result is always returned by the primary server, the other servers are
handled as fire-and-forget.

## Stability
The multiplexer has no reasonable stability yet. DO NOT USE IT IN PRODUCTION.