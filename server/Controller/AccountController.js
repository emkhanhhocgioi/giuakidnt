const taikhoan = require('../Model/accounts');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const {Types} = require('mongoose');
const Subscript =require('../Model/PreniumModel') ;
const conn = mongoose.createConnection('mongodb://localhost:27017/hardwaredb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
  console.log('GridFS initialized');
 
});








const signup = async (req, res) => {
    const { uname, email, password,PhoneNumber } = req.body;

    if (!uname) {
        return res.status(400).json({ message: 'Username is required' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    try {
        const existingUser = await taikhoan.findOne({ Email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        } 
        const newtk = new taikhoan({
            Username: uname,
            Email: email,
            Password: password,
            urole: 2,
            Desc: ' ',
            PhoneNumber:PhoneNumber,
            followercount: 0,
            followingcount: 0,
            imgProfile: ' ',
        });
        await newtk.save();
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
const signupPartner = async (req, res) => {
  const { uname, email, password,PhoneNumber } = req.body;

  if (!uname) {
      return res.status(400).json({ message: 'Username is required' });
  }
  if (!email) {
      return res.status(400).json({ message: 'Email is required' });
  }
  if (!password) {
      return res.status(400).json({ message: 'Password is required' });
  }
  if (!PhoneNumber) {
    return res.status(400).json({ message: 'phone number is required' });
}
try {
  const existingUser = await taikhoan.findOne({ Email: email });
  if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
  }


  const newtk = new taikhoan({
      Username: uname,
      Email: email,
      Password: password,
      urole: 1,
      Desc: ' ',
      PhoneNumber: PhoneNumber,
      followercount: 0,
      followingcount: 0,
      imgProfile: ' ',
  });

  
  await newtk.save();

 
  const newSubscript = new Subscript({
      Userid: newtk._id,  
      status: 0,
      signupdate: new Date(),
      expiredate: new Date(),
  });


  await newSubscript.save();

  return res.status(201).json({ message: 'User created and subscribed successfully' });
} catch (error) {
  console.error(error);
  return res.status(500).json({ message: 'Server error' });
}
};


const login = async (req, res) => {
     const { uname, password } = req.body;

     if (!uname) {
        return res.status(400).json({ message: 'please input username' });
     }
     if (!password) {
        return res.status(400).json({ message: 'please input password' });
     }
     try {
        const document = await taikhoan.findOne({ Username: uname });
        if (document) {
            if (document.Password != password) {
                return res.status(400).json({ message: 'wrong user password' });
            }
             const logindata = {
                uid:document._id,
                urole:document.urole
             }
            return res.send(logindata);
        }
     } catch (error) {
        console.log(error);
        return res.status(500).send(error);
     }
};

const getUserData = async (req, res) => {
  const { uid } = req.query;
  console.log(uid);
  if (!uid) {
    return res.status(400).json({ message: 'No user found' });
  }

  try {
    const document = await taikhoan.findOne({ _id: uid });
    const files = await gfs.find().toArray();

    if (!document) {
      return res.status(404).json({ message: 'User not found' });
    }

  

    const formattedDocument = {
      ObjecID: document._id,
      Email: document.Email,
      urole: document.urole,
      Desc: document.Desc,
      PhoneNumber: document.PhoneNumber,
      followercount: document.followercount,
      followingcount: document.followingcount,
      imgProfile: document.imgProfile,
    };

    res.json(formattedDocument);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserProfileImage = async (req, res) => {
  const { imgid } = req.query;
  console.log(imgid);
  
  
  if (!imgid) {
    return res.status(400).json({ message: 'No image found' });
  }
  
  if (!gfs) {
    return res.status(400).json({ message: 'No GFS' });
  }
  
  try {
 
    const ObjectID = new mongoose.Types.ObjectId(imgid);
    console.log(ObjectID);
  
   
    const files = await gfs.find({ _id: ObjectID }).toArray();
  
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files available',
      });
    }
  
    const file = files[0];
  

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      res.set('Content-Type', file.contentType);
      
     
      const downloadStream = gfs.openDownloadStream(file._id); 
      downloadStream.pipe(res);
    } else {
      return res.status(400).json({ error: 'File is not an image' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};


const editProfile = async (req, res) => {
    const { username, email, desc } = req.body;
    console.log(username, email, desc);

    if (!username) {
        return res.status(400).json({ message: 'No username provided' });
    }

    try {
        const updatedUser = await taikhoan.findOneAndUpdate(
            { Username: username },  
            { $set: { Email: email, Desc: desc } },  
            { new: true }  
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'No user found' });
        }

        return res.status(200).json({ message: 'Data update successful', user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating user data");
    }
};

const uploadProfile = async (req, res) => {
  const { uid, username, desc } = req.body;

  console.log(req.body);
 

  try {

    const user = await taikhoan.findOne({ Username: username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    
    const document = await taikhoan.findOneAndUpdate(
      { Username: username },
      { 
        $set: { 
          Desc: desc, 
          imgProfile: req.file.id 
        }
      },
      { new: true }
    );

    // Step 4: Return success message
    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user data");
  }
};
const resetPassword= async(req,res) =>{
  const{email,newpassword} =req.body;
  if(!email || !newpassword){
    console.log('missing required field')
  } 
  try {
    const doc = await taikhoan.findOneAndUpdate({Email:email},
      { $set: { Password: newpassword } },
      {new:true})
      if (!doc) {
        return res.status(404).json({ error: 'User not found' });
      }
    return res.json({ message: 'Password has been updated successfully' });

  } catch (error) {
    console.log(error)
  }
}


module.exports = { signup, login, getUserData, editProfile, uploadProfile, getUserProfileImage,signupPartner,resetPassword };
