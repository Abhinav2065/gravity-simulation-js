# gravity-simulation-js

This Project Simulates Gravity using newton's equations in both 2d and 3d. 
To make the 2d version of the Solar System we use js ctx but for 3d we use webGl to load the 3d spheres.
There is also another simulation which shows you how a object acts under gravity of a planet.


1. Object Acting Under Gravity:
    This simulation is the simples one of all 3, it just supposes acceleration due to gravity(g) as some constant and accordingly calculates the change in velocity for each change frame such that it looks like velocity is increasing after each frame and if the object collides with an wall then the velocity of the axis at which the ball collides will be reversed so that it goes on the opp direction.

2. 2d Solar System Simulation:
    This simulation simulates the solar system with some planets in 2d. You cannot move the camera like in the 3d simulation but you can see the beautiful planets and how they move. (its not accurate to the actual solar system but it is accurate to a planetary system with a star). It uses the same equations and physics as the 3d simulation but without the z-axis making it a bit simple. 

3. 3d Solar System Simulation:
    This simulation is the most complex one here. I used webGl to simulate the spheres first. Then i set a camera variable and made it such that it's value will change according to user's input (WASD and spacebad and shift). So then accordingly we can move around the space using those controls. Then i created a class named celistialBody that creates planets/stars or anything really and it also calculates the total force that should be experienced by a body and update forces so that it looks like the planets are moving and there it can also draw the planets. It uses the Newton's equations F = G*m1*m2/d^2 for calculating the force and divides into 3 axis and returns the forces for all three axis and then it computes the change in the position of planets.
    then there is a variable named solarsystem[] which stores all the stars and planets that are there currently and on which we can easily add more planets and see how that effects everything.


