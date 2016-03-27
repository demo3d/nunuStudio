function OrthographicCamera(left, right, top, bottom, near, far)
{
	THREE.OrthographicCamera.call(this, left, right, top, bottom, near, far);
	
	this.updateable = true;
	this.name = "ortho_camera";
	this.icon = "editor/files/icons/camera/orthographic.png";
}

OrthographicCamera.prototype = Object.create(THREE.OrthographicCamera.prototype);
OrthographicCamera.prototype.update = update;

function update()
{
	for(var i = 0; i < this.children.length; i++)
	{
		if(this.children[i].updateable)
		{
			this.children[i].update();
		}
	}
}