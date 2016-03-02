function Main(){}

//Test objects
var scene = null;
var camera = null;
var camera_rotation = null;
var renderer = null;
var cube = null;

//Object selection tests
var raycaster = null;
var selected_object = null;
var selected_object_material = null;

//VR stuff
var vr_manager = null;
var vr_controls = null;

Main.initialize = function(canvas)
{
	//Create camera and scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 100000);
	camera_rotation = new THREE.Vector2(0,0);

	//Raycaster
	raycaster = new THREE.Raycaster();

	//Renderer
	renderer = new THREE.WebGLRenderer({canvas: canvas});
	renderer.setSize(canvas.width, canvas.height);
	renderer.shadowMap.enabled = true;

	//Apply VR headset positional data to camera
	vr_controls = new THREE.VRControls(camera);
	var effect = new THREE.VREffect(renderer);
	effect.setSize(window.innerWidth, window.innerHeight);

	vr_manager = new WebVRManager(renderer, effect, {hideButton: false, isUndistorted: false});

	//Add cube to scene
	var material = new THREE.MeshPhongMaterial();
	cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
	cube.position.z = -3;
	scene.add(cube);

	//Create Floor
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	geometry.scale(100,1,100);
	
	var floor = new THREE.Mesh(geometry, material);
	floor.position.y = -1;
	scene.add(floor);

	//Load eyebot model (normal/specular mapped)
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl("data/models/eyebot/");
	mtlLoader.load("data/models/eyebot/eyebot.mtl", function(materials)
	{
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load("data/models/eyebot/eyebot.obj", function(object)
		{
			object.scale.set(0.03, 0.03, 0.03);
			object.position.set(4, 1, 4);
			for(var j = 0; j < object.children.length; j++)
			{
				object.children[j].geometry.computeFaceNormals();
			}
			scene.add(object);
		});
	});

	//Load bane model (multi material obj/mtl)
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setBaseUrl("data/models/bane/");
	mtlLoader.load("data/models/bane/bane.mtl", function(materials)
	{
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.load("data/models/bane/bane.obj", function(object)
		{
			object.scale.set(0.008, 0.008, 0.008);
			object.position.set(-4, -0.5, 4);
			scene.add(object);
		});
	});

	//Dummy OBJ load test
	var objLoader = new THREE.OBJLoader();
	objLoader.load("data/models/dummy/dummy.obj", function(object)
	{
		object.scale.set(0.01, 0.01, 0.01);
		object.position.set(-4, 0, 0);
		scene.add(object);
	});

	//Light
	var light = new THREE.AmbientLight(0x555555);
	scene.add(light);

	light = new THREE.PointLight(0x330000);
	light.position.set(8, 1, 0);
	scene.add(light);

	light = new THREE.PointLight(0x000033);
	light.position.set(-8, 1, 0);
	scene.add(light);

	light = new THREE.PointLight(0x003300);
	light.position.set(0, 1, -8);
	scene.add(light);

	//Grid and Axis Helper
	var gridHelper = new THREE.GridHelper(500, 10);
	scene.add(gridHelper);

	var axisHelper = new THREE.AxisHelper(500);
	scene.add(axisHelper);

	//Initialize Leap Hand
	LeapHand.initialize();
	scene.add(LeapHand.scene);
}

Main.update = function()
{
	//Rotate cube
	cube.rotation.x += 0.01;

	//Rotate Camera
	if(Keyboard.isKeyPressed(Keyboard.E))
	{
		camera_rotation.x -= 0.02;
	}
	if(Keyboard.isKeyPressed(Keyboard.Q))
	{
		camera_rotation.x += 0.02;
	}
	
	//Camera Mouse Movement
	camera_rotation.x -= 0.01 * Mouse.SENSITIVITY * Mouse.pos_diff.x;
	camera_rotation.y -= 0.01 * Mouse.SENSITIVITY * Mouse.pos_diff.y;

	//Limit Vertical Rotation to 90 degrees
	var pid2 = 1.5708;
	if(camera_rotation.y < -pid2)
	{
		camera_rotation.y = -pid2;
	}
	else if(camera_rotation.y > pid2)
	{
		camera_rotation.y = pid2;
	}
	
	//Calculate direction vector
	var cos_angle_y = Math.cos(camera_rotation.y);
    var direction = new THREE.Vector3(Math.sin(camera_rotation.x)*cos_angle_y, Math.sin(camera_rotation.y), Math.cos(camera_rotation.x)*cos_angle_y);
    
    //Add position offset and set camera direction
    direction.x += camera.position.x;
    direction.y += camera.position.y;
    direction.z += camera.position.z;
    camera.lookAt(direction);
	
	//Update VR headset position and apply to camera.
	//vr_controls.update();

	//Move Camera with WASD
	var speed_walk = 0.2;
	var angle_cos = Math.cos(camera_rotation.x);
	var angle_sin = Math.sin(camera_rotation.x);
	if(Keyboard.isKeyPressed(Keyboard.S))
	{
		camera.position.z -= speed_walk * angle_cos;
		camera.position.x -= speed_walk * angle_sin;
	}
	if(Keyboard.isKeyPressed(Keyboard.W))
	{
		camera.position.z += speed_walk * angle_cos;
		camera.position.x += speed_walk * angle_sin;
	}

	var angle_cos = Math.cos(camera_rotation.x + Math.PI/2.0);
	var angle_sin = Math.sin(camera_rotation.x + Math.PI/2.0);
	if(Keyboard.isKeyPressed(Keyboard.A))
	{
		camera.position.z += speed_walk * angle_cos;
		camera.position.x += speed_walk * angle_sin;
	}
	if(Keyboard.isKeyPressed(Keyboard.D))
	{
		camera.position.z -= speed_walk * angle_cos;
		camera.position.x -= speed_walk * angle_sin;
	}

	if(Keyboard.isKeyPressed(Keyboard.SPACEBAR))
	{
		camera.position.y += 0.1;
	}
	if(Keyboard.isKeyPressed(Keyboard.CTRL))
	{
		camera.position.y -= 0.1;
	}

	
	//Rasycast line from camera and mouse position
	if(Mouse.buttonJustPressed(Mouse.LEFT))
	{
		var mouse = new THREE.Vector2((Mouse.pos.x/window.innerWidth )*2 - 1, -(Mouse.pos.y/window.innerHeight)*2 + 1);
		
		//Update the picking ray with the camera and mouse position	
		raycaster.setFromCamera(mouse, camera);	

		var intersects = getSceneAllIntersected(scene, raycaster);

		//Change closeste object material
		if(intersects.length > 0)
		{
			intersects[0].object.material = new THREE.MeshNormalMaterial();
		}
	}

}

//Return a list of all intersected object in a scene
function getSceneAllIntersected(scene, raycaster)
{
	var intersects = raycaster.intersectObjects(scene.children);

	for(var i = 0; i < scene.children.length; i++)
	{
		intersects = intersects.concat(getSceneAllIntersected(scene.children[i], raycaster));
	}

	return intersects;
}

//Draw stuff into screen
Main.draw = function()
{
	vr_manager.render(scene, camera, App.time);
}

//Resize to fit window
Main.resize = function(canvas)
{
	renderer.setSize(canvas.width, canvas.height);
	camera.aspect = canvas.width/canvas.height;
	camera.updateProjectionMatrix();
}